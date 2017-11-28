import {
  UPDATE_PROVIDER_SUCCESS,
  FETCH_PROVIDER_SUCCESS,
  SIGN_OUT_SUCCESS,
  REFRESH_CHANNEL_TYPE_SUCCESS,
} from 'constants/actionTypes'

const providersReducer = (state = {}, action) => {

  const pld = action.payload
  switch (action.type) {

    case SIGN_OUT_SUCCESS:
      return {}

    case UPDATE_PROVIDER_SUCCESS:
      return Object.assign({}, state, action.payload)

    case FETCH_PROVIDER_SUCCESS:
      return Object.assign({}, state, action.payload)

    case REFRESH_CHANNEL_TYPE_SUCCESS:
      let newState = Object.assign({}, state)
      //get one to find out which provider and which channelType was retrieved for
      let sampleChannel = pld[0]

      //getting reference for that object, and just editing it. Will change newState too automatically
      let account = _.find(newState[sampleChannel.provider], (account) => account.id === sampleChannel.accountId)
      //returns all channels of that channel type, old and new, so just overwrite everything for that provider's channeltype
      _.remove(account.channels, (c) => sampleChannel.type === c.type)
      account.channels.concat()

      return newState

    default:
      return state
  }
}

export default providersReducer

