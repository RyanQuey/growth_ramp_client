import uuid from 'uuid/v1';
//TODO remove lib if possible...but other libs might require it or something
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
import campaignHelpers from './campaignHelpers'

let Helpers = {
  // extracts the relevant passport profile data from the profile auth data received on login/request, and matches it to the database columns
  // don't think I ever use this...only in nodeHelpers.js
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
    console.log("DEPRECATED_._DON'T_USE_THIS");
    console.log(errors);
    errorActions.handleErrors(errors, templateName, templatePart, options)
  },

  //takes a list of scopes for an account and returns the list of available channels for that account
  //might make a helper function if I needed anywhere else
  permittedChannelTypes: (account) => {
    if (!account || typeof account !== "object") {
      return []
    }
    const permittedScopes = Object.keys(account.scopes).filter((scopeType) => {
      return account.scopes[scopeType].status === 'granted'
    })

    const permittedChannelTypes = Object.keys(PROVIDERS[account.provider].channelTypes).filter((channelType) => {
      const channelScopes = PROVIDERS[account.provider].channelTypes[channelType].requiredScopes

      return channelScopes.every((scope) => (permittedScopes.includes(scope))) //also returns true when the channel requires no scopes at all (empty array)
    })

    return permittedChannelTypes
  },

  accountFromPost: (post) => {
    const providerAccounts = store.getState().providerAccounts[post.provider]
    const postAccount = providerAccounts.find((account) => account.id === (post.providerAccountId.id || post.providerAccountId))
    return postAccount
  },

  //only for when channel type has multiple; otherwise there is no channel record
  channelFromPost: (post) => {
console.log(post);
    if (!Helpers.channelTypeHasMultiple(null, post.provider, post.channelType)) {return false}
    const postAccount = Helpers.accountFromPost(post)
console.log(postAccount);
    const channelRecord = postAccount.channels.find(channel => channel.id === (post.channelId.id || post.channelId))
    return channelRecord
  },

  //takes upper scored provider name and returns friendly name
  //either need channel or the other two
  providerFriendlyName: (providerName) => PROVIDERS[providerName].name,

  //takes channel record and returns friendly name
  //either need channel or the other two
  channelTypeFriendlyName: (channel, providerName, channelType) => PROVIDERS[providerName || channel.provider].channelTypes[channelType || channel.type].name,

  //takes channel record and returns whether the channel type normally has multiple channels for it
  //either need channel or the other two
  //NOTE currently, ALL channel records have multiple, hence why they are channel records. Personal posts don't get a record.
  channelTypeHasMultiple: (channel, providerName, channelType) => PROVIDERS[providerName || channel.provider].channelTypes[channelType || channel.type].hasMultiple,

  //takes channel record and returns required scopes
  //either need channel or the other two
  channelTypeScopes: (channel, providerName, channelType) => PROVIDERS[providerName || channel.provider].channelTypes[channelType || channel.type].requiredScopes,

  channelPostingAsTypes: (channel, providerName, channelType) => PROVIDERS[providerName || channel.provider].channelTypes[channelType || channel.type].postingAsTypes,

  //flattening to a single array
  flattenProviderAccounts: () => {
    let allProviderAccounts = _.values(Helpers.safeDataPath(store.getState(), `providerAccounts`, {}))
    allProviderAccounts = [].concat.apply([], allProviderAccounts)
    return allProviderAccounts
  },

  //sorts accounts, grouping according to provider
  sortAccounts: (accounts) => {
    const providerNames = Object.keys(PROVIDERS)
    const sorted = accounts.reduce((acc, account) => {
      const providerName = account.provider
      if (!acc[providerName]) {
        acc[providerName] = [account]
      } else {
        acc[providerName].push(account)

      }

      return acc
    }, {})

    return sorted
  },

}

Helpers = Object.assign(Helpers, campaignHelpers)

export default Helpers
