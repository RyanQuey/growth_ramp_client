import uuid from 'uuid/v1';
import $ from 'jquery';
import {
  CLEAR_ERRORS,
  HANDLE_ERRORS,
} from 'constants/actionTypes'
import {
  newAlert
} from 'shared/actions/alerts'

export default {
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
  },

  notifyOfAPIError: (errors, templateName, templatePart, options = {})  => {
    console.log(errors);

    //as a shortcut, allow passing in an error obj with all the arguments as properties
    if (typeof errors === "object") {
      if (!Array.isArray(errors)) {
        if (!templateName && errors.templateName) {
          templateName = errors.templateName
        }
        if (!templatePart && errors.templatePart) {
          templatePart = errors.templatePart
        }
        //don't want to override the option, but otherwise,set it
        if (!options.alert && options.alert !== false && errors.alert) {
          options.alert = errors.alert
        }
console.log(templateName, errors, options.alert);
        errors = [errors]
      }
    }

    if (!templateName) {
      console.log("we are handling this, but pass in a template name");
      templateName = "Generic"
    }
    if (!templatePart) {
      console.log("we are handling this, but pass in template part");
      templateName = "generic"
    }

    //by default, we will just override whatever errors existed previously for this part of the template
    //however, can change this using options
    if (options.method === "addToExisting") {
      errors = store.getState().errors[templateName].concat(errors)
    }
    if (options.alert && errors.length > 0) {
      if (options.combineAlerts) {
        newAlert({
          title: options.combinedTitle || "Several errors occurred",
          message: options.combinedMessage || "Please check the fields below and try again",
          level: options.combinedLevel || "WARNING",
          timer: options.timer || true,
          options: options.alertOptions || {},
        })
      } else {
        errors.forEach((err) => {
          newAlert({
            title: err.title || "Unknown error",
            message: err.message || "Please refresh your page and try again",
            level: err.level || "WARNING",
            timer: options.timer || true,
            options: options.alertOptions || {},
          })
        })
      }
    }

    store.dispatch({
      type: HANDLE_ERRORS,
      payload: {
        templateName,
        templatePart,
        errors,
      }
    })
  },
  clearErrors: (templateName, templatePart) => {
    // do not pass in templatePart to clear the errors for all of the template
    // do not pass in templateName to clear all of the errors
    const payload = {templateName, templatePart}

    store.dispatch({
      type: CLEAR_ERRORS,
      payload
    })
  },
}

