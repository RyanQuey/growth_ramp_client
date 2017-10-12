process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});

const express = require('express');
const session = require("express-session")// passport with providers require sessions. https://github.com/jaredhanson/passport-twitter/issues/43
const path = require('path');
//helps with performance been serving the favicon
const favicon = require('serve-favicon');
//has its own API, might want to tap into tap into
const logger = require('morgan');
//const cookieParser = require('cookie-parser'); //appears to be in compatible with express-session
const bodyParser = require('body-parser');
const request = require('request')
//const axios = require('axios') don't use for now; is unnecessary, and request works, whereas this one gets blocked (maybe because sending to port eighty?)
const url = require('url')
const uuid = require('uuid/v5')
const fs = require('fs-extra')

//to modify the HTML file with the  data
//no sense in a full-fledged template engine for something this simple
const Transform = require('stream').Transform

const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const TwitterStrategy = require('passport-twitter').Strategy

const Helpers = require('./nodeHelpers')

passport.use(new FacebookStrategy(
  Helpers.facebookOptions,
  function(req, accessToken, refreshToken, profile, done) {
    //console.log(accessToken, refreshToken, profile);
    if (!refreshToken) {
      refreshToken = req.query.code
    }
    const providerData = Helpers.extractPassportData(accessToken, refreshToken, profile)

    return Helpers.tradeTokenForUser(providerData, done)
  }
))
//appsecret is automatically set (?)

passport.use(new TwitterStrategy(
  Helpers.twitterOptions,
  function(accessToken, tokenSecret, profile, done) {
    //passing in the token secret as the refresh token for twitter
    const providerData = Helpers.extractPassportData(accessToken, tokenSecret, profile)
    //need to set a timeout for this. maybe wrap in a promise?
    return Helpers.tradeTokenForUser(providerData, done)
  }
))

const app = express();
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const secretString = uuid("beware_lest_you_get_caught_sleeping", process.env.CLIENT_FACEBOOK_SECRET)

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'dist', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
//app.use(cookieParser()); //apparently incompatible with express-sessions
//get requests for static files will be relative to the public folder (/app = project_root/public/app)
app.use(express.static(path.join(__dirname, '/dist')));
//NOTE: express session and passport session required no matter what in order for passport oauth to work...I'm not really using it though
app.use(session({
  secret: secretString,
  cookie: {
    secure: false//env.NODE_ENV === "development" ? false : "true"
  },
  resave: true,//I've no idea what this does
  saveUninitialized: false,
})) //TODO there are other options that might need to consider...before production, need to change this session stored for example (see docs)
app.use(passport.initialize());
app.use(passport.session());

app.get('/login/twitter', ((req, res, next) => {
console.log("logging in with twitter");
  passport.authenticate('twitter')(req, res, next)
}))

//TODO: make this combine dynamically into the Twitter one, which works
app.get('/login/facebook', (req, res, next) => {
  passport.authenticate('facebook')(req, res, next)
})

app.get(`${Helpers.callbackPath}/:provider`, (req, res, next) => {
  const providerName = req.params.provider.toLowerCase()
  if (!["facebook", "twitter", "google"].includes(providerName)) {next()}

  const providerCallback = function(err, userAndProvider, info) {
    console.log(req.user, req.account);
    console.log("********************************************");
    console.log("user and provider", userAndProvider, "info",info);
    if (err || !userAndProvider) {
      console.log("error after authenticating into provider:");
      console.log(err);
      //next ...I think sends this along to the next route that matches, which will just render the app anyway(?)
      return next(err);
    }
    //NOTE: don't try changing this are making more simple, unless you have lots of free time...is just a time draiting the.
    //note that userAndProvider is a JSON string, but not in query format. making this more simple probably begins with trying to return this not as a JSON string from Sails in the first place...or just JSON.parse it here if I can't
    req.query.userAndProvider = userAndProvider

    next()
  }

  //TODO: Facebook recommends verifying any request made to this callback path, since anyone can ask the access it, not to Facebook, and pass in any sort of token
  //maybe want to do the same thing with twitter, who actually sends an oauth_verifier along with the tokens
  //NOTE: in order to get it to pop up, will require some client-side JavaScript, https://github.com/jaredhanson/passport-facebook/issues/18  ...looks like a mess. otherwise , though,
  //calls the callback defined in the strategy, THEN passes that info to the providerCallback
  passport.authenticate(providerName, providerCallback)(req, res, next)
})

app.use('/api/*', function(req, res) {
  const method = req.method.toLowerCase();
  const body = req.body;
  const headers = {}

  const url = `${apiUrl}${req.originalUrl.split('/api')[1]}`
console.log(url);
  //can eventually combine with tradeTokenForUser? piping makes it harder; you cannot pipe on just any function
  request[method]({
    //remove the 'api' in front, so we can take advantage of the default sails routes
    url: url,
    headers: headers,
    form: body
  })
  .on('error', function(err, response, responseBody) {
      console.error("***error:***")
      console.log(err)
      //console.log( "***body:***", responseBody, "***header:***", headers, "***url***", url);
      //TODO: might need to shut down server for security reasons if there is an error? or at least, certain kinds of errors?
      //https://stackoverflow.com/questions/14168433/node-js-error-connect-econnrefused

  })
  .pipe(res)
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// let react handle the routing from there
app.get('*', (req, res) => {
console.log(req.query, req.url);
  res.sendFile(path.join(__dirname + '/dist/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  err.message = "Route ( or resource?) does not exist"
  // this is what forwards to the next one
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // what is returned in an error
  res.status(err.status || 500);
  res.json({
    error: err,
    message: err.message,
    status: err.status || 500,
  });
});

const port = process.env.PORT || 5000;
app.listen(port);
