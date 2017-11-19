import {
  CREATE_CAMPAIGN_SUCCESS,
  UPDATE_CAMPAIGN_SUCCESS,
  SET_CURRENT_CAMPAIGN,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

const currentCampaignReducer = (state = null, action) => {

  let campaign
  switch (action.type) {

    case UPDATE_CAMPAIGN_SUCCESS:
      if (store.getState().currentCampaign.id === action.payload.id) {
        campaign = action.payload
        return Object.assign({}, campaign)
      } else {
        return state
      }

    case SET_CURRENT_CAMPAIGN:
      campaign = action.payload
      return Object.assign({}, campaign)

    case SIGN_OUT_SUCCESS:
      return null

    default:
      return state
  }
}

export default currentCampaignReducer

