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
//const axios = require('axios') don't use for now; is unnecessary, and request works, whereas this one gets blocked (maybe because sending to port eighty?)
const url = require('url')
const uuid = require('uuid/v5')

const NodeFB = require('fb')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const TwitterStrategy = require('passport-twitter').Strategy

const domain = env.CLIENT_URL || 'http://www.local.dev:5000'
const callbackPath = env.PROVIDER_CALLBACK_PATH || '/provider_redirect'
const callbackUrl = domain + callbackPath

const contactApi = function(url, method, headers, body, cb) {
  request[method]({
    //remove the 'api' in front, so we can take advantage of the default sails routes
    url: `${apiUrl}${url}`,
    headers: headers,
    form: body
  }
, function (err, res, body) {
    if(err) {
      console.error("***error:***")
      console.log(err)
      console.log( "***body:***", body, "***header:***", headers, "***url***", url);
      //TODO: might need to shut down server for security reasons if there is an error? or at least, certain kinds of errors?
      //https://stackoverflow.com/questions/14168433/node-js-error-connect-econnrefused

    } else if (cb) {
      cb(res, body)
    }
  })
}

const tradeTokenForUser = ((profile, tokenInfo, done) => {
  console.log("beginning API callvim ");
  const url = "/users/login_with_provider"
  const body = {profile,tokenInfo}
  const headers = {}
  const cb = ((res, responseBody) => {
    console.log("I made it", res, responseBody);
    done(null, responseBody)
  })

  contactApi(url, 'post', headers, body, cb)
})
const facebookOptions = {
  clientID: env.CLIENT_FACEBOOK_ID,
  clientSecret: env.CLIENT_FACEBOOK_SECRET,
  callbackURL: `${callbackUrl}/facebook`,
  passReqToCallback: true,//to extract the code from the query...for some reason, passport doesn't get it by default
  //scope: 'email, '
}
passport.use(new FacebookStrategy(
  facebookOptions,
  function(req, accessToken, refreshToken, profile, done) {
    //console.log(accessToken, refreshToken, profile);
    if (!refreshToken) {
      refreshToken = req.query.code
    }
console.log(refreshToken);
    const tokenInfo = {
      accessToken, refreshToken
    }
    tradeTokenForUser(profile, tokenInfo, done)
  }
))
//appsecret is automatically set (?)

const twitterOptions = {
  consumerKey: env.TWITTER_CONSUMER_KEY,
  consumerSecret: env.TWITTER_CONSUMER_SECRET,
  callbackUrl: `${callbackUrl}/twitter`
}
passport.use(new TwitterStrategy(
  twitterOptions,
  function(accessToken, tokenSecret, profile, done) {
    console.log("info from the callback",accessToken, tokenSecret, profile);
    const tokenInfo = {
      accessToken,//originally called just token
      refreshToken: tokenSecret
    }
    //normally, need to retrieve user here

    tradeTokenForUser(profile, tokenInfo, done)
  }
))

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
const secretString = uuid("beware_lest_you_get_caught_sleeping", process.env.CLIENT_FACEBOOK_SECRET)

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
//app.use(cookieParser()); //apparently incompatible with express-sessions
//get requests for static files will be relative to the public folder (/app = project_root/public/app)
app.use(express.static(path.join(__dirname, '/public')));
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
  passport.authenticate('twitter')(req, res, next)
}))
app.get(`${callbackPath}/twitter`, (req, res, next) => {
  //call the callback defined in the strategy
  passport.authenticate('twitter',
    //gets called after the call back to find in the strategy
    function(err, user, info) {
      console.log(req.user, req.account);
console.log("********************************************");
      console.log(user, info);
      if (err) {
        console.log(err);
        return next(err);
      }
      //if (!user) { return res.redirect('/'); }

      return res.redirect('/');
    }
  )(req, res, next)
})

app.get('/login/facebook', (req, res, next) => {
  //need to find out if can have these...or even if I need to
  const otherOptions = {
    display: 'popup',
    state: secretString, //An arbitrary unique string created by your app to guard against Cross-site Request Forgery. TODO: find out how to use this
    response_type: 'code' //get back a code for refreshing and an access_token
  }
  passport.authenticate('facebook')(req, res, next)
})

//req.user automatically sent to the authenticated user

app.get(`${callbackPath}/facebook`, (req, res, next) => {
  //call the callback defined in the strategy
  passport.authenticate('facebook')(req, res, next)
  //TODO: handle the errors, particularly if the user denies permission
  //https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
console.log("********************************************");
  res.redirect('/')
})

app.use('/api/*', function(req, res) {
  const method = req.method.toLowerCase();
  const body = req.body;
  const headers = {}

  const url = `${apiUrl}${req.originalUrl.split('/api')[1]}`
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
      console.log( "***body:***", responseBody, "***header:***", headers, "***url***", url);
      //TODO: might need to shut down server for security reasons if there is an error? or at least, certain kinds of errors?
      //https://stackoverflow.com/questions/14168433/node-js-error-connect-econnrefused

  })
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
