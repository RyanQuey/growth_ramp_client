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

const express = require('express');
const path = require('path');
//helps with performance been serving the favicon
const favicon = require('serve-favicon');
//has its own API, might want to tap into tap into
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const request = require('request')
const axios = require('axios')
const url = require('url')
const uuid = require('uuid/v5')
const NodeFB = require('fb')

const domain = process.env.CLIENT_URL || 'http://www.local.dev:5000'
const callbackPath = process.env.PROVIDER_CALLBACK_PATH || '/provider_redirect'
const callbackUrl = domain + callbackPath

const fbOptions = {
  client_id: process.env.CLIENT_FACEBOOK_ID,
  client_secret: process.env.CLIENT_FACEBOOK_SECRET,
  redirect_uri: `${callbackUrl}/facebook`,
  //Promise: require('bluebird')//maybe want to do this?
  //scope: 'email, '
}
//appsecret is automatically set (?)

const app = express();
const apiUrl = process.env.API_URL;

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
//get requests for static files will be relative to the public folder (/app = project_root/public/app)
app.use(express.static(path.join(__dirname, '/public')));

  const secretString = uuid("beware_lest_you_get_caught_sleeping", process.env.CLIENT_FACEBOOK_SECRET)
app.get('/login/facebook', (req, res) => {
  const fbUrl = NodeFB.getLoginUrl(Object.assign(fbOptions, {
    display: 'popup',
    state: secretString, //An arbitrary unique string created by your app to guard against Cross-site Request Forgery. TODO: find out how to use this
    response_type: 'code' //get back a code for refreshing and an access_token
  }))

  res.redirect(fbUrl)
})

app.get(`${callbackPath}/facebook`, (req, res) => {
  //access_token is automatically saved to cookies(?)
  /*const refreshToken = req.query.code //Facebook calls refresh token a code
  const returnedState = req.query.state
  //make sure that this request came from Facebook, not an attacker
  if(req.query.error) {
    console.log("Error making call back after logging into Facebook:");
    if(req.query.error_description) {
      console.log(req.query.error_description);
    } else {
      console.log(req.query.error);
    }
    return;
  } else if (!returnedState !== secretString) {
    console.log("cors attack");
    //we have a cors situation on our hands(?)
  } else if (!refreshToken) {
    console.log('not a oauth callback');
    return;
  }

  //generates a query string in order to pass the data using a redirect (redirects don't allow post)
  const pathWithQuery = url.format({
    pathname: '/',
    refreshToken,
  })

  //maybe don't need this
  */
console.log("should never go herexv");
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
