//TODO for helpers that overlap with the JavaScript helpers in the front and,, can just import from there. DRY things up
const request = require('request')
let env
if (process.env.NODE_ENV !== 'production') {
  const result = require('dotenv').config()

  if (result.error) {
    throw result.error
  }

  console.log(result.parsed)
  env = result.parsed // this should === process.env
} else {
  env = process.env
}
//TODO use path.resolve or whatever...these extra slashes are killing me
const domain = env.CLIENT_URL || 'http://www.local.dev:5000'
const callbackPath = '/provider_redirect'
const callbackUrl = domain + callbackPath
const apiUrl = process.env.API_URL || 'http://localhost:1337';

const uuid = require('uuid/v4');
const $ = require('jquery');
const _ = require('lodash')

//TODO can put back in objectr and just use Helpers.extractCookie
const extractCookie = (allCookies) => {
  const splitCookies = allCookies.split("; ")
  //don't need all of this, only need the sessionUser!
  /*const cookiesObject = splitCookies.reduce((acc, cookie) => {
    let keyAndValue = cookie.split("=")
    let key =  keyAndValue[0]
    let value = keyAndValue[1]
    acc[key] = value
    return acc
  }, {})*/
  const ret = {}
  const cookiesObject = splitCookies.forEach((cookie) => {
    let keyAndValue = cookie.split("=")
    let key = keyAndValue[0]
    let value = keyAndValue[1]
console.log(value);
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
  extractCookie: extractCookie,

  safeDataPath: function (object, keyString, def = null) {
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
  extractPassportData: (accessToken, refreshToken, passportProfile, accessTokenSecret, req) => {
    let userData = _.pickBy(passportProfile, (value, key) => {
      return ["providerUserId", "email"].includes(key)
    })
    userData.provider = passportProfile.provider.toUpperCase()

    if (userData.provider === "TWITTER") {
      userData.userName = passportProfile.username
      userData.profilePictureUrl = passportProfile.profile_image_url_https

    } else if (userData.provider === "FACEBOOK") {
      if (!refreshToken) {
        refreshToken = req.query.code//not sure if this is really the refreshtoken...might just be a temporary code that passport will use.
      }
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

    } else if (userData.provider === "LINKEDIN") {
      if (!refreshToken) {
        refreshToken = req.query.code//not sure if this is really the refreshtoken...might just be a temporary code that passport will use.
      }
      userData.userName = passportProfile.displayName
      userData.profileUrl = passportProfile._json.publicProfileUrl
      userData.email = Helpers.safeDataPath(passportProfile, "emails.0.value", "")
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

    userData.photoUrl = Helpers.safeDataPath(passportProfile, "photos.0.value", "")
    userData.providerUserId = passportProfile.id
    userData.accessToken = accessToken
    userData.refreshToken = refreshToken
    //only twitter sends; because oauth1 probably
    userData.accessTokenSecret = accessTokenSecret

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
    //scope: 'email, '
  },

  linkedinOptions: {
    clientID: env.CLIENT_LINKEDIN_ID,
    clientSecret: env.CLIENT_LINKEDIN_SECRET,
    callbackURL: `${callbackUrl}/linkedin`,
    //gets read access for these two
    scope: ['r_emailaddress', 'r_basicprofile'],
    passReqToCallback: true,//to extract the code from the query...for some reason, passport doesn't get it by default. also to get cookies
    state: true, //a security thing
  },

  //checks if user rejected the request to add permission...though they had asked for it...
  parseProviderResponse: {
    //TODO implement for other platforms
    linkedin: (req, err, raw) => {
      //if the user rejected the permissions they just asked to give...
      if (err && err.code === 'user_cancelled_authorize') {
        return "user-rejected"

      } else if (err || !raw) {
        console.log("should never get here (LI)");
        console.log("ERROR: Unknown");
        console.log(err);

        return "unknown-error"
      }

      return "success"
    },
    facebook: (req, err, raw) => {
      console.log(err);
      //if the user rejected the permissions they just asked to give...
      if (req.query && req.query.error === 'access_denied') {
        //then, redirect back to app
        return "user-rejected"

      } else if (err || !raw){
        console.log("should never get here (FB)");
        console.log("ERROR: Unknown");
        console.log(err);

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
        console.log("should never get here (FB)");
        console.log("ERROR: Unknown");
        console.log(err);

        return "unknown-error"
      }

      return "success"
    },
  }

}

module.exports = Helpers
