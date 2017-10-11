const result = require('dotenv').config()
if (result.error) {
  throw result.error
}

console.log(result.parsed)
const env = result.parsed // this should === process.env
const domain = env.CLIENT_URL || 'http://www.local.dev:5000'
const callbackPath = env.PROVIDER_CALLBACK_PATH || '/provider_redirect'
const callbackUrl = domain + callbackPath

const uuid = require('uuid/v1');
const $ = require('jquery');
const _ = require('lodash')

module.exports = {
  callbackPath: callbackPath,
  //eventually will probably do more, but just this for now

  // extracts the relevant passport profile data from the profile auth data received on login/request, and matches it to the database columns
  extractPassportData: (accessToken, refreshToken, passportProfile) => {
    passportProfile.name = passportProfile.provider.toUpperCase()
    if (passportProfile.name === "TWITTER") {
      passportProfile.userName = passportProfile.user_name
    }

    if (passportProfile.name === "FACEBOOK") {
      passportProfile.userName = passportProfile.displayName
    }

    passportProfile.providerUserId = passportProfile.id

    let userData = _.pickBy(passportProfile, (value, key) => {
      return ["providerUserId", "userName", "email", "name"].includes(key)
    })

    userData.accessToken = accessToken
    userData.refreshToken = refreshToken

    return userData
  },

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

  tradeTokenForUser: ((providerData, done) => {
    const url = "/users/login_with_provider"

    const body = providerData
    const headers = {}

    let timeout
    request.post({
      //remove the 'api' in front, so we can take advantage of the default sails routes
      url: `${apiUrl}${url}`,
      headers: headers,
      form: body,
      timeout: 3000
    }, function (err, res, responseBody) {
      if(err) {
        console.error("***error:***")
        done(err)
        //TODO: might need to shut down server for security reasons if there is an error? or at least, certain kinds of errors?
        //https://stackoverflow.com/questions/14168433/node-js-error-connect-econnrefused

      } else {
        console.log("I made it", res);
        done(null, responseBody)
      }
    })
  }),


  twitterOptions: {
    consumerKey: env.TWITTER_CONSUMER_KEY,
    consumerSecret: env.TWITTER_CONSUMER_SECRET,
    callbackUrl: `${callbackUrl}/twitter`
  },

  facebookOptions: {
    clientID: env.CLIENT_FACEBOOK_ID,
    clientSecret: env.CLIENT_FACEBOOK_SECRET,
    callbackURL: `${callbackUrl}/facebook`,
    passReqToCallback: true,//to extract the code from the query...for some reason, passport doesn't get it by default
    //scope: 'email, '
  },

  //gets called after the callback defined in the strategy
  providerCallback: function(err, userAndProvider, info) {
    console.log(req.user, req.account);
    console.log("********************************************");
    console.log("user and provider", userAndProvider, "info",info);
    if (err || !userAndProvider) {
      console.log("error after authenticating into provider:");
      console.log(err);
      //next ...I think sends this along to the next route that matches, which will just render the app anyway(?)
      return next(err);
    }
    /*return res.redirect(url.format({
      pathname: "/",
      query: {
      }
    }));*/
    req.query = {userAndProvider: userAndProvider}
    next()
  },

}
