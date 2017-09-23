process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});

const result = require('dotenv').config()
if (result.error) {
  throw result.error
}

console.log(result.parsed)
const env = result.parsed // this should === process.env

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
const axios = require('axios')
const url = require('url')
const uuid = require('uuid/v5')
const NodeFB = require('fb')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const TwitterStrategy = require('passport-twitter').Strategy

const domain = env.CLIENT_URL || 'http://www.local.dev:5000'
const callbackPath = env.PROVIDER_CALLBACK_PATH || '/provider_redirect'
const callbackUrl = domain + callbackPath

const twitterOptions = {
  consumerKey: env.TWITTER_CONSUMER_KEY,
  consumerSecret: env.TWITTER_CONSUMER_SECRET,
  callbackUrl: `${callbackUrl}/twitter`
}

const facebookOptions = {
  clientID: env.CLIENT_FACEBOOK_ID,
  clientSecret: env.CLIENT_FACEBOOK_SECRET,
  callbackURL: `${callbackUrl}/facebook`,
  //scope: 'email, '
}

passport.use(new FacebookStrategy(
  facebookOptions,
  function(accessToken, refreshToken, profile, done) {
    console.log(accessToken, refreshToken, profile);
//normally, need to retrieve user here

    done(null, profile)
  }
))
passport.use(new TwitterStrategy(
  twitterOptions,
  function(token, tokenSecret, profile, done) {
    console.log(token, tokenSecret, profile);
//normally, need to retrieve user here

    done(null, profile)
  }
))
console.log(twitterOptions);

//appsecret is automatically set (?)

//I don't know what this does
//things seem to work with or without it , at least at this point
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const app = express();
const apiUrl = process.env.API_URL;

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
//app.use(cookieParser());
//get requests for static files will be relative to the public folder (/app = project_root/public/app)
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
  secret: env.CLIENT_FACEBOOK_SECRET + "kikjmyhn7887",
  cookie: {
    secure: false//env.NODE_ENV === "development" ? false : "true"
  },
  resave: true,//I've no idea what this does
  saveUninitialized: false,
})) //TODO there are other options that might need to consider...before production, need to change this session stored for example (see docs)
app.use(passport.initialize());
app.use(passport.session());


const secretString = uuid("beware_lest_you_get_caught_sleeping", process.env.CLIENT_FACEBOOK_SECRET)

app.get('/login/twitter', ((req, res, next) => {
  console.log("beginning to authenticate");
  passport.authenticate('twitter')(req, res, next)
}))
app.get(`${callbackPath}/twitter`, (req, res, next) => {
  passport.authenticate('twitter', function(err, user, info) {

    console.log(err,user, info);
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }

    return res.redirect('/');
  })(req, res, next)
})

  /*((req, res) => {
console.log(req.user); //req.user automatically sent to the authenticated user
    //don't make post to the API except when redirecting from the browser!! or else you can't pipe the data back to the browser in the right spot!!
  })*/

//currently not using this; trying to do it in the browser instead
app.get('/login/facebook', (req, res, next) => {
  //need to find out if can have these...or even if I need to
  const otherOptions = {
    display: 'popup',
    state: secretString, //An arbitrary unique string created by your app to guard against Cross-site Request Forgery. TODO: find out how to use this
    response_type: 'code' //get back a code for refreshing and an access_token
  }
  passport.authenticate('facebook')(req, res, next)
})

app.get(`${callbackPath}/facebook`, (req, res) => {

  //generates a query string in order to pass the data using a redirect (redirects don't allow post)
  const pathWithQuery = url.format({
    pathname: '/',
    refreshToken,
  })

  //maybe don't need this
  res.redirect('/')
  //TODO: handle the errors, particularly if the user denies permission
  //https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
})

app.use('/api/*', function(req, res) {
  const method = req.method.toLowerCase();
  const body = req.body;
  const headers = {}

  const url = `${apiUrl}${req.originalUrl.split('/api')[1]}`
  request[method]({
    //remove the 'api' in front, so we can take advantage of the default sails routes
    url: url,
    headers: headers,
    form: req.body
  })
  .on('error', function(err, res, body) {
      console.error("***error:***")
      console.log(err)

    console.log( "***body:***", body, "***header:***", headers, "***url***", url);
  //console.log(req);
//TODO: might need to shut down server for security reasons if there is an error? or at least, certain kinds of errors?
//https://stackoverflow.com/questions/14168433/node-js-error-connect-econnrefused

  })
  //return the response to the place where the request was made
  .pipe(res)
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// let react handle the routing from there
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + 'public/index.html'));
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
