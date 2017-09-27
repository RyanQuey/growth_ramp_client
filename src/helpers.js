import uuid from 'uuid/v1';
import $ from 'jquery';

export default {
  //eventually will probably do more, but just this for now
  handleError: (err) => {
    let obj = {}
    //if a response from oauth...
    if (err && err.type === "OAuthException") { //got this from using an inactive access token making a Facebook post
      if (err.code === 2500) {
        obj.message = "Facebook access expired; please login again"
        obj.origin = "facebook"
      } else if (err.code === 506 && err.error_subcode === 1455006) {
        obj.message = "Can't make the same status update twice in a row; Please edit and try again"
        obj.origin = "facebook"
      }
    } else if (err.code === 'auth/account-exists-with-different-credential' ) {
      alert("Error signing in with provider: The account you logged in with exists for a different user. Each social media account can only be attached to one Growth Ramp account")
    } else {
      obj = err
    }
    console.log(err);
//probably one pop up to appear

    return obj
  },

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

  handleParam: function (e, key) {
    const objKey = key || e.target.dataset.key
    const obj = {};

    obj[objKey] = e.target.value;

    this.setState(obj);
  }
}
