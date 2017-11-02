import uuid from 'uuid/v1';
import $ from 'jquery';
import {
  CLEAR_ERRORS,
  HANDLE_ERRORS,
} from 'constants/actionTypes'
import {
  errorActions
} from 'shared/actions'
import {
  newAlert
} from 'shared/actions/alerts'
import { PROVIDERS } from 'constants/providers'

export default {
  // extracts the relevant passport profile data from the profile auth data received on login/request, and matches it to the database columns
  // don't think I ever use this...only in nodeHelpers.js
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
      return ["providerUserId", "userName", "email", "name", "profileUrl"].includes(key)
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

  //might do away with...but might be helpful if have lots of fields to iterate over
  handleParam: function (e, key) {
    const objKey = key || e.target.dataset.key
    const obj = {};

    obj[objKey] = e.target.value;

    this.setState(obj);
  },

  //TODO don't use this anymore, just call error actions
  notifyOfAPIError: (errors, templateName, templatePart, options = {})  => {
    console.log(errors);
    errorActions.handleErrors(errors, templateName, templatePart, options)
  },

  //takes a list of scopes for an account and returns the list of available channels for that account
  //might make a helper function if I needed anywhere else
  permittedChannels: (account) => {
    if (!account || typeof account !== "object") {
      return []
    }
    const permittedScopes = Object.keys(account.scopes).filter((scopeType) => {
      return account.scopes[scopeType].status === 'granted'
    })

    const permittedChannels = Object.keys(PROVIDERS[account.provider].channels).filter((channel) => {
      const channelScopes = PROVIDERS[account.provider].channels[channel]
      return channelScopes.every((scope) => (permittedScopes.includes(scope))) //also returns true when the channel requires no scopes at all (empty array)
    })

    return permittedChannels
  }

}

