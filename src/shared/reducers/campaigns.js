import {
  CREATE_CAMPAIGN_SUCCESS,
  UPDATE_CAMPAIGN_SUCCESS,
  FETCH_CAMPAIGN_SUCCESS,
  SIGN_OUT_SUCCESS,
  SET_CURRENT_CAMPAIGN,
} from 'constants/actionTypes'

const campaignsReducer = (state = {}, action) => {

  let campaign
  switch (action.type) {

    case SET_CURRENT_CAMPAIGN:
      campaign = action.payload
      return Object.assign({}, state, {[campaign.id]: action.payload})

    case FETCH_CAMPAIGN_SUCCESS:
      return Object.assign({}, action.payload)

    case CREATE_CAMPAIGN_SUCCESS:
      return Object.assign({}, state, action.payload)

    case UPDATE_CAMPAIGN_SUCCESS:
      campaign = action.payload
      return Object.assign({}, state, {[campaign.id]: campaign})

    case SIGN_OUT_SUCCESS:
      return {}

    default:
      return state
  }
}

export default campaignsReducer

