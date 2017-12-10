process.on('uncaughtException', function (exception) {
  console.log("uncaught exception");
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});

const multer = require('multer')
const B2 = require('backblaze-b2')
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
const querystring = require('querystring')
const uuid = require('uuid/v4')
const fs = require('fs-extra')

//to modify the HTML file with the  data
//no sense in a full-fledged template engine for something this simple
const Transform = require('stream').Transform

const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

const Helpers = require('./nodeHelpers')
const PROVIDERS = require('./src/constants/providers').PROVIDERS

passport.use(new FacebookStrategy(
  Helpers.facebookOptions,
  function(req, accessToken, refreshToken, profile, done) {
    //console.log(accessToken, refreshToken, profile);
    //console.log("***profile***");
    //console.log(profile);
    const providerData = Helpers.extractPassportData(accessToken, refreshToken, profile, "", req)
//console.log("providerData", providerData);
    const cookie = Helpers.extractCookie(req.headers.cookie)

    return Helpers.tradeTokenForUser(providerData, cookie, done)
  }
))
//appsecret is automatically set (?)

passport.use(new TwitterStrategy(
  Helpers.twitterOptions,
  function(req, accessToken, tokenSecret, profile, done) {
    //passing in the token secret as the refresh token for twitter
    //oauth1 is reason why, I think
    const providerData = Helpers.extractPassportData(accessToken, "", profile, tokenSecret, req)
    const cookie = Helpers.extractCookie(req.headers.cookie)
    //console.log("***profile***");
    //console.log(profile);
    return Helpers.tradeTokenForUser(providerData, cookie, done)
  }
))

passport.use(new LinkedInStrategy(
  Helpers.linkedinOptions,
  function(req, accessToken, refreshToken, profile, done) {
    if (!refreshToken) {
      refreshToken = req.query.code//not sure if this is really the refreshtoken...might just be a temporary code that passport will use.
    }
    //console.log("***profile***");
    //    console.log(profile);

    const providerData = Helpers.extractPassportData(accessToken, refreshToken, profile, "", req)
    const cookie = Helpers.extractCookie(req.headers.cookie)
//console.log(req.body, req.params, req.query);

    return Helpers.tradeTokenForUser(providerData, cookie, done)
  }
))
//appsecret is automatically set (?)

const app = express();
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const secretString = uuid()

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

app.get('/login/:provider', ((req, res, next) => {
  const providerName = req.params.provider.toLowerCase()
  //options will look like this for example: {scope: __, authType: 'rerequest'}
  const options = req.query || {}
  //NOTE: linkedin with passport doesn't seem to support this, but facebook might (Jared says it does). Could even add queries potentially
  if (providerName === 'linkedin' && options.scope) {
    //this is what I tried, didn't work because linked-in-passport doesn't support dynamically setting url like this
    //options.callbackUrl = `${Helpers.callbackUrl}/${providerName}/${options.scope.join("+")}`
  }

  //make sure to get the defaults again, just in case they don't already have them... Also, linkedin doesn't send the id by default, which I need to verify if it's the same account or a new account :)
  //so far this only does anything for linkedIn
  if (options.scope) {
    let scope = Array.isArray(options.scope) ? options.scope : [options.scope]
    options.scope = scope.concat(Helpers[`${providerName}Options`].scope || [])
  }

//console.log("callback path (only set for LI)");
//console.log(options.callbackUrl);
  passport.authenticate(providerName, options)(req, res, next)
}))

//TODO: make this combine dynamically into the Twitter one, which works
/*app.get('/login/facebook', (req, res, next) => {
  passport.authenticate('facebook')(req, res, next)
})*/

app.get(`${Helpers.callbackPath}/:provider`, (req, res, next) => {
  const providerName = req.params.provider.toLowerCase()
  if (!["facebook", "twitter", "linkedin"].includes(providerName)) {
    console.log("someone is hacking us I think. Unless provider is app.js, in which case it's going to growthramp.io/provider_redirect/facebook or something.")
    console.log("They tried:", req.params.provider);
    //TODO if req.params.provider === "app.js", should redirect to home page
    next()
  }
  const cookie = Helpers.extractCookie(req.headers.cookie)

  const providerCallback = function(err, raw, info) {
    /*console.log(req.user, req.account);
    console.log("********************************************");
    console.log("user and provider", raw, "info",info);*/
    console.log(err, raw, info);

    const result = Helpers.parseProviderResponse[providerName](req, err, raw)

    switch (result) {
      case "user-rejected":
        //if the user rejected the permissions they just asked to give...
        //const user = cookie.user
        //then, redirect back to app
        //NOTE: currently not using the providerName part
        return res.redirect(`/?alert=canceledAuthorization&providerName=${providerName}`)

      case "unknown-error":
        //should never get here
        //next ... breaks the app, puts node err message on screen
        return next(err);

      case "success":
        //worked fine!

      default:
        //worked fine!
    }

    if (err || !raw) {
      //should never get here...totally unhandled error
      //try to handle everything in Helpers.parseProviderResponse
      console.log(`error after authenticating into ${providerName}: `);
      console.log(err);

      return next(err || `Nothing returned after authenticating into ${providerName} (don't know why) `);
    }
    //otherwise, things worked fine

    //man...could have just taken the cookie from the req.header  and returned that as the user. Oh well
    const data = JSON.parse(raw)
    const user = JSON.stringify(data.user)
    const provider = JSON.stringify(data.provider)
    //NOTE: don't try changing this are making more simple, unless you have lots of free time...is just a time drain
    //it appears that you cannot change the URL in the browser without doing res.redirect, even if you change the req.query, or res.locals
    //and another approach would be to set res.locals, then transform the html file before sending...but that seems potentially dangerous and hacky.(?). this saves a step.
console.log("now redirecting");
    res.redirect(`/?user=${user}&provider=${provider}`)
    //next()
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
console.log("now contacting API");
  //for some reason axios is using 'content-type': 'application/json;charset=UTF-8'
  //this might have something to do with it: https://github.com/axios/axios/issues/362
  delete req.headers["content-type"]
  //only want to take these headers; for the rest, set them again automatically using request (though axios could probably do it too)
  const headers = {
    'x-user-token': req.headers['x-user-token'],
    'x-id': req.headers['x-id'],
  }

//NOTE: the headers also contain the cookies...perhaps could use that
  const url = `${apiUrl}${req.originalUrl.replace('/api', "")}`
  //can eventually combine with tradeTokenForUser? piping makes it harder; you cannot pipe on just any function
//console.log("******************************");

  //console.log(url);
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


const b2 = new B2({
  accountId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
})

const bucketId = process.env.B2_BUCKET_ID

const initializeB2 = () => {
  return new Promise((resolve, reject) => {
    let uploadUrl, authToken, downloadUrl
    //authorize each time, token expires every 24 hours
    //might be able to optimize this somehow
    b2.authorize()
    .then((result) => {
      console.log(result.data);
      downloadUrl = result.data.downloadUrl
      //NOTE: don't use this auth token, use the one returned from getUploadUrl, they are different, and this one will be outdated
      //want multiple of these, for faster uploads
      //maybe not one per upload...will see
      return b2.getUploadUrl(bucketId)
    })
    .then((result) => {
      console.log(result.data);
      uploadUrl = result.data.uploadUrl
      authToken = result.data.authorizationToken

      return resolve({uploadUrl, authToken, downloadUrl})
    })
  })
}

const extractForm = multer()

const upload = (file, uploadUrl, authToken) => {
  return new Promise((resolve, reject) => {
    b2.uploadFile({
      uploadUrl: uploadUrl,
      uploadAuthToken: authToken,
      filename: file.originalname,
      mime: file.mimetype, //defaults to b2-auto if not provided, which might be more resilient
      data: file.buffer,
      onUploadProgress: (event) => {
        console.log(event);
      }
    })
    .then((result) => {
      console.log("finished uploading");
      return resolve(result.data)
    })
    .catch((err) => {
      console.log("failure uploading to b2");
      console.log(err.response);
      //TODO allow other uploads to continue by just resolving
      return reject(err.response)
    })
  })
}


//not currently using
/*const localStorage = multer.diskStorage({
  destination: 'tmp/uploads',
  filename: (req, file, cb) => cb(null, file.originalname)
})
const tempUpload = multer({ storage: localStorage });
*/
//setting maximum of five
app.post('/upload', extractForm.single('fileToUpload'), function(req, res, next) {
  //if there were any other fields sent with the upload
  //maybe to save user id or something with the file?
  let formData = req.body

  if (!req.file) {
    res.status(500)
    res.send('no files uploaded')
  }

  let downloadUrl

  initializeB2()
  .then((data) => {
    downloadUrl = data.downloadUrl
console.log("finished initializing");
console.log(data);
console.log("file and body");
console.log(req.file, req.body);

    let file = req.file
    return upload(file, data.uploadUrl, data.authToken)
  })
  .then((results) => {
    console.log("results");
console.log(results);
    const fullDownloadUrl = `${downloadUrl}/file/${process.env.B2_BUCKET_NAME || 'growth-ramp-user-uploads'}/${results.fileName}`

    res.send(fullDownloadUrl)

  })
  .catch((err) => {console.log(err);})
})

/*app.post('/temp-upload', tempUpload.single("file"), function(req, res, next) {
  const fullFile = [];
  const fileName = req.file.filename;
  const csvFilePath = path.join("tmp/uploads", fileName);

  csvtojson()
  .fromFile(csvFilePath)
  .on('json', (subObject) => {
    fullFile.push(subObject);
  })
  .on('done', (err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(fullFile)
    }
  })
})*/


// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// let react handle the routing from there
app.get('*', (req, res) => {
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
