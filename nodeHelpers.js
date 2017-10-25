//TODO for helpers that overlap with the JavaScript helpers in the front and,, can just import from there. DRY things up
const request = require('request')
let env
if (!process.env.NODE_ENV === 'production') {
  const result = require('dotenv').config()

  if (result.error) {
    throw result.error
  }

  console.log(result.parsed)
  env = result.parsed // this should === process.env
} else {
  env = process.env
}
const domain = env.CLIENT_URL || 'http://www.local.dev:5000'
const callbackPath = env.PROVIDER_CALLBACK_PATH || '/provider_redirect'
const callbackUrl = domain + callbackPath
const apiUrl = process.env.API_URL || 'http://localhost:1337';

const uuid = require('uuid/v1');
const $ = require('jquery');
const _ = require('lodash')

module.exports = {
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

  tradeTokenForUser: ((providerData, cookie, done) => {
    const url = "/users/login_with_provider"

    const body = providerData
    //at this point, the cookie is the user
    const headers = {
      "x-user-token": cookie.apiToken,
      "x-id": `user-${cookie.id}`
    }

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

  extractCookie: (allCookies) => {
    const splitCookies = allCookies.split("; ")
    //don't need all of this, only need the sessionUser!
    /*const cookiesObject = splitCookies.reduce((acc, cookie) => {
      let keyAndValue = cookie.split("=")
      let key =  keyAndValue[0]
      let value = keyAndValue[1]

      acc[key] = value

      return acc
    }, {})*/
    let ret
    const cookiesObject = splitCookies.forEach((cookie) => {
      let keyAndValue = cookie.split("=")
      let key = keyAndValue[0]
      let value = keyAndValue[1]

      if (key === "sessionUser") {
        ret = JSON.parse(unescape(value))
      }

      return
    })

    return ret
  },
  //eventually will probably do more, but just this for now

  // extracts the relevant passport profile data from the profile auth data received on login/request, and matches it to the database columns
  extractPassportData: (accessToken, refreshToken, passportProfile) => {
    let userData = _.pickBy(passportProfile, (value, key) => {
      return ["providerUserId", "email"].includes(key)
    })
    userData.provider = passportProfile.provider.toUpperCase()
    if (userData.provider === "TWITTER") {
      userData.userName = passportProfile.user_name
      userData.profilePictureUrl = passportProfile.profile_image_url_https

    } else if (userData.provider === "FACEBOOK") {
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
      userData.email = passportProfile.emails[0].value
    }

    userData.providerUserId = passportProfile.id
    userData.accessToken = accessToken
    userData.refreshToken = refreshToken

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


}
