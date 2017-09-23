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

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy
//const TwitterStrategy = require('passport-twitter').Strategy

const domain = process.env.CLIENT_URL || 'http://www.local.dev:5000'
const callbackPath = process.env.PROVIDER_CALLBACK_PATH || '/provider_redirect'
const callbackUrl = domain + callbackPath

//do I need this? wasn't in the Facebook example
passport.initialize()

passport.use(new FacebookStrategy(
  {
    clientID: process.env.CLIENT_FACEBOOK_ID,
    clientSecret: process.env.CLIENT_FACEBOOK_SECRET,
    callbackURL: `${callbackUrl}/facebook`,
    //enableProof: true //need to do this eventually
  },
  function(accessToken, refreshToken, profile, done) {
    //done is a call back that must be called "providing a user to complete authentication" (see the docs)
    //User.findOrCreate({ })
    console.log(accessToken, refreshToken, profile, done);
    axios.post('/api/users/login_with_provider', {accessToken, refreshToken, profile})
    .then((user) => {
      console.log(user);
      return done(null, user)
    })
    .catch((err) => {
      console.log(err);
      return done(err, false)
    })
  }
))

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

/////////////////////////////////////
//might want to use sessions,and this
/*
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
*/











app.get('/login/facebook',
  passport.authenticate('facebook')
)

//oauth with Facebook will send back here no matter what (?)
app.get(`${callbackPath}/facebook`, (req, res) => {
  console.log("made it back");
//maybe don't need this
  res.redirect('/')
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
