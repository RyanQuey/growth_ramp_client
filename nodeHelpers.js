//TODO for helpers that overlap with the JavaScript helpers in the front and,, can just import from there. DRY things up
const request = require('request')
let env
if (process.env.NODE_ENV !== 'production') {
  const result = require('dotenv').config()

  if (result.error) {
    throw result.error
  }

  // logs all env vars
  //console.log(result.parsed)
  env = result.parsed // this should === process.env
} else {
  env = process.env
}
//TODO use path.resolve or whatever...these extra slashes are killing me
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const B2 = require('backblaze-b2')
const moment = require('moment')

const uuid = require('uuid/v4');
//const $ = require('jquery');
const _ = require('lodash')

const b2 = new B2({
  accountId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
})

const bucketId = process.env.B2_BUCKET_ID
const domain = 'http://www.lvh.me:5000' || env.CLIENT_URL || 'http://www.local.test:5000' //Google doesn't like local.test. use http://www.lvh.me:5000
const callbackPath = '/provider_redirect'
const callbackUrl = domain + callbackPath

//TODO can put back in objectr and just use Helpers.extractCookie
const extractCookie = (allCookies) => {
  const splitCookies = allCookies && allCookies.split("; ")
  //don't need all of this, only need the sessionUser!
  /*const cookiesObject = splitCookies.reduce((acc, cookie) => {
    let keyAndValue = cookie.split("=")
    let key =  keyAndValue[0]
    let value = keyAndValue[1]
    acc[key] = value
    return acc
  }, {})*/
  const ret = {}

  splitCookies && splitCookies.forEach((cookie) => {
    let keyAndValue = cookie.split("=")
    let key = keyAndValue[0]
    let value = keyAndValue[1]
    if (!value || !unescape(value) || value === "undefined") {return}

    try {
      if (key === "requestedScopes") {
        ret.scopes = JSON.parse(unescape(value))
        //TODO erase this cookie; won't need it again

      }
      if (key === "sessionUser") {
        ret.user = JSON.parse(unescape(value))
      }
    } catch (err) {
      console.log("BROKEN KEY AND VALUE:", key, value);
      console.log("all cookies", splitCookies);
      console.log(err);
      return
    }
  })
  return ret
}

const Helpers = {
  //TODO put this back into the object
  extractCookie: extractCookie,

  safeDataPath: function (object, keyString = "", def = null) {
    let keys = keyString.split('.');
    let returnValue = def;
    let safeObject = object;

    if (!safeObject) {
      return def;
    }

    for (let key of keys) {
      if (safeObject[key]) {
        returnValue = safeObject[key];
        safeObject = safeObject[key];
      } else {
        return def;
      }
    }

    return returnValue;
  },

  uniqueId: function () {
    return uuid()
  },

  findUser: (params, cb) => {
    let timeout
    request.get({
      //remove the 'api' in front, so we can take advantage of the default sails routes
      url: `${apiUrl}/users`,
      form: params,
      timeout: 3000
    }, function (err, res, responseBody) {
      if(err) {
        console.error("***error:***")
        cb(err)
        //TODO: might need to shut down server for security reasons if there is an error? or at least, certain kinds of errors?
        //https://stackoverflow.com/questions/14168433/node-js-error-connect-econnrefused

      } else {
        console.log("I made it", res);
        cb(null, responseBody)
      }
    })
  },

  callbackPath: callbackPath,
  callbackUrl: callbackUrl,


  initializeB2: () => {
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
  },

  //doesn't reject until t ms, which is helpful for async retries
  //use in a catch cb
  b2Upload: (file, uploadUrl, authToken, maxRetries = 3) => {
    let keepTrying = true
    let tries = 0

    const rejectDelay = (err, t = 500) => {
      console.log("Failure to upload: ", err);
      return new Promise((resolve, reject) => {
        //TODO list errors that don't want to retry. Otherwise, keep going
        //make sure that err.code === "service_unavailable" does retry a few times though
        if (err === "no-retry") {
          keepTrying = false
          console.log("Not retrying");
          reject(err)
        } else {
          console.log("Now retrying in ", t, " ms");
          setTimeout(reject.bind(null, err), t)
        }
      })
    }

    const attempt = () => {
      tries ++
      console.log("Attempt #", tries);

      return b2.uploadFile({
        uploadUrl: uploadUrl,
        uploadAuthToken: authToken,
        filename: file.originalname,
        mime: file.mimetype, //defaults to b2-auto if not provided, which might be more resilient
        data: file.buffer,
        onUploadProgress: (event) => {
          console.log(event);
        }
      })
    }

    //https://stackoverflow.com/questions/38213668/promise-retry-design-patterns
    let p = Promise.reject()
    for (let i = 0; i < maxRetries; i++) {
      if (keepTrying) {
        //if it fails, will set p as a rejected promise, and then run again. Hence, why it needs to start as a rejected promise in the first place
        //if succeeds, will quickly loop through remaining retries and since catch is never called after that, will just return the successful p
        p = p.catch(attempt).catch(rejectDelay, 500 + 500*i)
      }
    }
    //after success and finishing looping, goes here
    p = p.then((result) => {
      return result.data
    })
    .catch((err) => {
      return Promise.reject(err.response || err)
    })

    //basically returns a huge promise chain like
    //p.catch(...).catch(...).catch(...).catch(...).catch(...).catch(...).then(...).catch(...)
    return p
  },

  //also persists the new provider data
  tradeTokenForUser: ((providerData, cookie, done) => {
    const url = "/users/login_with_provider"
    const user = cookie.user
    let headers
    if (user) {
      headers = {
        "x-user-token": user.apiToken,
        "x-id": `user-${user.id}`
      }
    }
    const body = providerData
    //at this point, the cookie is the user

    let timeout
    request.post({
      //remove the 'api' in front, so we can take advantage of the default sails routes
      url: `${apiUrl}${url}`,
      headers: headers,
      form: body,
      timeout: 9000
    }, function (err, res, responseBody) {
      if(err) {
        console.error("***error:***")
        done(err)
        //TODO: might need to shut down server for security reasons if there is an error? or at least, certain kinds of errors?
        //https://stackoverflow.com/questions/14168433/node-js-error-connect-econnrefused

      } else {
        done(null, responseBody)
      }
    })
  }),

  //eventually will probably do more, but just this for now

  // extracts the relevant passport profile data from the profile auth data received on login/request, and matches it to the database columns
  // only twitter has a tokenSecret so far
  // TODO not so many args, pass in an object
  // clean up this mess of a func
  extractPassportData: (accessToken, refreshToken, passportProfile, accessTokenSecret, req, params) => {
    let userData = _.pickBy(passportProfile, (value, key) => {
      return ["providerUserId", "email"].includes(key)
    })
    userData.photoUrl = Helpers.safeDataPath(passportProfile, "photos.0.value", "")
    userData.providerUserId = passportProfile.id
    userData.accessToken = accessToken
console.log("\n\n refresh token", refreshToken);
    userData.refreshToken = refreshToken
    //only twitter sends; because oauth1 probably
    userData.accessTokenSecret = accessTokenSecret
    userData.provider = passportProfile.provider.toUpperCase()

    if (userData.provider === "TWITTER") {
      userData.userName = passportProfile.username
      userData.profilePictureUrl = passportProfile.profile_image_url_https

    } else if (userData.provider === "FACEBOOK") {
      //fb not supporting refresh tokens, just long-lived access token (or they do support, but passport doesn't, or something)
      userData.userName = passportProfile.displayName
      //not sure why permissions are sent in this _json property only, but whatever
      //mapping to an object, with keys being the scope
      userData.scopes = {}
      let scopes = passportProfile._json.permissions.data
      for (let i = 0; i < scopes.length; i++) {
        let scope = scopes[i]
        userData.scopes[scope.permission] = {status: scope.status}
      }
      //only persisting one email
      userData.email = Helpers.safeDataPath(passportProfile, "emails.0.value", "")

   // TODO need to figure out what to extract
    } else if (userData.provider === "GOOGLE") {
      userData.userName = passportProfile.displayName
      //not sure why permissions are sent in this _json property only, but whatever
      //mapping to an object, with keys being the scope
      //TODO get scopes somehow. FOr now only allowing basic options
      userData.scopes = {}
      //only persisting one email
      //TODO this might be for all providers, so don't need conditional
      userData.email = Helpers.safeDataPath(passportProfile, "emails.0.value", "")

    } else if (userData.provider === "LINKEDIN") {
      //no refresh token available
      userData.userName = passportProfile.displayName
      userData.profileUrl = passportProfile._json.publicProfileUrl
      userData.email = Helpers.safeDataPath(passportProfile, "emails.0.value", "")
      expiresIn = params && params.expires_in
      userData.accessTokenExpires = expiresIn && moment.utc().add(expiresIn, "seconds").format()

      //mapping to an object, with keys being the scope
      userData.scopes = {}

      const cookie = extractCookie(req.headers.cookie)
      const scopes = cookie.scopes

      if (scopes) {
        for (let i = 0; i < scopes.length; i++) {
          let scope = scopes[i]
          userData.scopes[scope] = {status: 'granted'}  //not recording it at all if they reject :)
        }
      }
    }

    return userData
  },


  twitterOptions: {
    consumerKey: env.TWITTER_CONSUMER_KEY,
    consumerSecret: env.TWITTER_CONSUMER_SECRET,
    callbackUrl: `${callbackUrl}/twitter`,
    passReqToCallback: true,//to extract the code from the query...for some reason, passport doesn't get it by default. also to get cookies
  },

  facebookOptions: {
    clientID: env.CLIENT_FACEBOOK_ID,
    clientSecret: env.CLIENT_FACEBOOK_SECRET,
    callbackURL: `${callbackUrl}/facebook`,
    profileFields: [
      'id',
      'displayName',
      'email',
      'picture',
      //'link' for link to persons timeline;
      //'accounts': Facebook pages this person administers
      //conversations: Facebook messenger conversation. closely related to
      //threads: and message conversation thread
      //businesses: businesses associated with the user
      //friends
      'permissions', //this app 's current permissions
    ],
    passReqToCallback: true,//to extract the code from the query...for some reason, passport doesn't get it by default. also to get cookies
    scope: ["publish_actions", "email"],
    enableProof: true,
  },

  googleOptions: { //TODO
    clientID: env.CLIENT_GOOGLE_ID,
    clientSecret: env.CLIENT_GOOGLE_SECRET,
    callbackURL: `${callbackUrl}/google`,
    passReqToCallback: true,//to extract the code from the query...for some reason, passport doesn't get it by default. also to get cookies
    scope: [
      "https://www.googleapis.com/auth/analytics.readonly", // to GET google analytics
      "https://www.googleapis.com/auth/userinfo.profile", // to login with this token later, and passport seems to need it. ANd this is probably better than google plus stuff
      "https://www.googleapis.com/auth/userinfo.email", // to login with this token later, and passport seems to need it. ANd this is probably better than google plus stuff
      //"https://www.googleapis.com/auth/plus.login", // to login with this token later, and passport seems to need it
    ],
  },

  linkedinOptions: {
    clientID: env.CLIENT_LINKEDIN_ID,
    clientSecret: env.CLIENT_LINKEDIN_SECRET,
    callbackURL: `${callbackUrl}/linkedin`,
    //gets read access for these two
    scope: ['r_emailaddress', 'r_basicprofile', 'w_share'],

    //https://github.com/auth0/passport-linkedin-oauth2/issues/24
    //ran into this, so specifying profileFields
    profileFields: [
      'email-address',
      'id',
      'first-name',
      'last-name',
      'public-profile-url',
      'picture-url',
      //'api-standard-profile-request:(headers,url)',
      //'formatted-name',
      //'permissions', //this app 's current permissions
    ],

    passReqToCallback: true,//to extract the code from the query...for some reason, passport doesn't get it by default. also to get cookies
    state: true, //a security thing
  },

  //checks if user rejected the request to add permission...though they had asked for it...
  parseProviderResponse: {
    //TODO implement for other platforms
    linkedin: (req, err, raw) => {
      //if the user rejected the permissions they just asked to give...
      if (err && (err.code === 'user_cancelled_authorize' || err.code === "user_cancelled_login")) {
        return "user-rejected"

      } else if (err || !raw) {
        console.log("should never get here (LI)");
        console.log("ERROR: Unknown");
        console.log(err);

        return "unknown-error"

      } else if (raw) {
        try {
          //note: raw might be good data from provider
          let data = JSON.parse(raw)
          if (data.code && data.code === "no-sign-up-with-oauth") {
            //we're not allowing it right now. Logging in, not signing up
            return "forbidden-oauth-signup"
          }

        } catch (err) {
          //because...not sure what else to do
          return "success"
        }
      }

      return "success"
    },
    facebook: (req, err, raw) => {
      console.log("Exception from Facebook:"); //could be from our api, if decided to throw something too :) (if so, expect it in the raw)
      console.log(err);
      //if the user rejected the permissions they just asked to give...
      if (err && err.code === 100) {
        //then, redirect back to app
        return "invalid-code"

      //I'm actually getting a 200 code with this
      //provider_redirect/facebook?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_
      } else if (err && err.code === 10 || req.query.error === "access_denied") {
        return "user-rejected"
      } else if (raw) {
        try {
          //note: raw might be good data from provider
          let data = JSON.parse(raw)
          if (data.code && data.code === "no-sign-up-with-oauth") {
            //we're not allowing it right now. Logging in, not signing up
            return "forbidden-oauth-signup"
          }

        } catch (err) {
          //because...not sure what else to do
          return "success"
        }

      } else if (err || !raw){
        console.log("should never get here (FB)");
        console.log("ERROR: Unknown");
        console.error(err);

        return "unknown-error"
      }

      return "success"
    },
    google: (req, err, raw) => {
      // TODO need to add this error handling
      console.log("Exception from Google:"); //could be from our api, if decided to throw something too :) (if so, expect it in the raw)
      console.log(err);
      //if the user rejected the permissions they just asked to give...
      if (err && err.code === 1000) { //TODO fix this
        //then, redirect back to app
        return "invalid-code"

      //I'm actually getting a 200 code with this
      //provider_redirect/facebook?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_
      } else if (err && err.code === 10 || req.query.error === "access_denied") { //TODO add this
        return "user-rejected"
      } else if (raw) {
        try {
          //note: raw might be good data from provider
          let data = JSON.parse(raw)
          if (data.code && data.code === "no-sign-up-with-oauth") {
            //we're not allowing it right now. Logging in, not signing up
            return "forbidden-oauth-signup"
          }

        } catch (err) {
          //because...not sure what else to do
          return "success"
        }

      } else if (err || !raw){
        console.log("should never get here (Google)");
        console.log("ERROR: Unknown");
        console.error(err);

        return "unknown-error"
      }

      return "success"
    },
    twitter: (req, err, raw) => {
      //if the user rejected the permissions they just asked to give...
      if (req.query && req.query.denied) {
        //then, redirect back to app
        return "user-rejected"

      } else if (err || !raw) {
        console.log("should never get here (Twitter)");
        console.log("ERROR: Unknown");
        console.error(err);

        return "unknown-error"

      } else if (raw) {
        try {
          //note: raw might be good data from provider
          let data = JSON.parse(raw)
          if (data.code && data.code === "no-sign-up-with-oauth") {
            //we're not allowing it right now. Logging in, not signing up
            return "forbidden-oauth-signup"
          }

        } catch (err) {
          //because...not sure what else to do
          return "success"
        }
      }

      return "success"
    },
  }

}

module.exports = Helpers
