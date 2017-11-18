import {
  CREATE_CAMPAIGN_SUCCESS,
  UPDATE_CAMPAIGN_SUCCESS,
  SET_CAMPAIGN,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

const currentCampaignReducer = (state = null, action) => {

  switch (action.type) {

// NOTE just using params for now. Easier to track, alerts user what's happening too
    /*case CREATE_CAMPAIGN_SUCCESS:
      return Object.assign({}, action.payload)

    case UPDATE_CAMPAIGN_SUCCESS:
      if (store.getState().currentCampaign.id === action.payload.id) {
        return Object.assign({}, action.payload)
      } else {
        return state
      }

    case SET_CAMPAIGN:
      return Object.assign({}, action.payload)

    case SIGN_OUT_SUCCESS:
      return null*/

    default:
      return state
  }
}

export default currentCampaignReducer

