import {
  UPDATE_PROVIDER_SUCCESS,
  FETCH_PROVIDER_SUCCESS,
  SIGN_OUT_SUCCESS,
  REFRESH_CHANNEL_TYPE_SUCCESS,
  CREATE_FAKE_ACCOUNT_SUCCESS,
  CREATE_FAKE_CHANNEL_SUCCESS,
} from 'constants/actionTypes'

const providersReducer = (state = {}, action) => {
  let newState, accounts, account, channels

  const pld = action.payload
  switch (action.type) {

    case SIGN_OUT_SUCCESS:
      return {}

    case CREATE_FAKE_ACCOUNT_SUCCESS:
      newState = Object.assign({}, state)
      // get accts for this provider
      accounts = newState[pld.provider] ? [...newState[pld.provider]] : []

      //add empty channels array, as if it was just retrieved
      pld.channels = pld.channels || []
      //push the new acct
      accounts.push(pld)
      newState[pld.provider] = accounts

      return Object.assign({}, newState)

    case CREATE_FAKE_CHANNEL_SUCCESS:
      newState = Object.assign({}, state)
      // get accts for this provider

      accounts = newState[pld.provider] ? [...newState[pld.provider]] : []
      //push the new channel
      account = accounts.find((a) => a.id === pld.providerAccountId)
      account.channels = account.channels || []
      account.channels.push(pld)

      newState[pld.provider] = accounts

      return Object.assign({}, newState)

    case UPDATE_PROVIDER_SUCCESS:
      return Object.assign({}, state, action.payload)

    case FETCH_PROVIDER_SUCCESS:
      return Object.assign({}, state, action.payload)

    case REFRESH_CHANNEL_TYPE_SUCCESS:
      let newState = Object.assign({}, state)
      //get one to find out which provider and which channelType was retrieved for
      if (!pld || !pld.length) {return state}
      let sampleChannel = pld[0]

      //getting reference for that object, and just editing it. Will change newState too automatically
      let providerAccounts = newState[sampleChannel.provider]
      account = _.find(providerAccounts, (a) => a.id === sampleChannel.providerAccountId)
      account.channels = account.channels || []
      //returns all channels of that channel type, old and new, so just overwrite everything for that provider's channeltype
      _.remove(account.channels, (c) => sampleChannel.type === c.type)
      account.channels = account.channels.concat(pld)

      return newState

    default:
      return state
  }
}

export default providersReducer

