import {
  CREATE_CAMPAIGN_SUCCESS,
  UPDATE_CAMPAIGN_SUCCESS,
  CREATE_POST_SUCCESS,
  UPDATE_POST_SUCCESS,
  DESTROY_POST_SUCCESS,
  SET_CURRENT_CAMPAIGN,
  SIGN_OUT_SUCCESS,
  PUBLISH_CAMPAIGN_SUCCESS,
} from 'constants/actionTypes'

const currentCampaignReducer = (state = null, action) => {

  let campaign, post, campaignPosts, postIndex
  switch (action.type) {

    case UPDATE_CAMPAIGN_SUCCESS:
      if (store.getState().currentCampaign.id === action.payload.id) {
        campaign = action.payload
        return Object.assign({}, campaign)
      } else {
        return state
      }

    case PUBLISH_CAMPAIGN_SUCCESS:
      campaign = pld.campaign
      if (campaign.id = state.id) {
        campaign.posts = pld.posts
        return Object.assign({}, state, {[campaign.id]: campaign})

      } else {
        return state
      }


    case SET_CURRENT_CAMPAIGN:
      campaign = action.payload
      return Object.assign({}, campaign)

    case CREATE_POST_SUCCESS:
      post = action.payload
      if (post.campaignId = state.id) {
        campaign = Object.assign({}, state)
        campaignPosts = [...campaign.posts].push(post)
        campaign.posts = campaignPosts

        return Object.assign({}, state, campaign)

      } else {
        return state
      }

    //NOTE might be easier to just retrieve campaign from db again...but this is faster.
    case UPDATE_POST_SUCCESS:
      post = action.payload
      if (post.campaignId = state.id) {
        campaign = Object.assign({}, state)
        campaignPosts = [...campaign.posts]
        postIndex = _.findIndex(campaignPosts, (p) => p.id === post.id)


        //replaces that item in the array
        campaignPosts.splice(postIndex, 1, post)
        campaign.posts = campaignPosts

        return Object.assign({}, state, campaign)

      } else {
        return state
      }

    //NOTE might be easier to just retrieve campaign from db again...but this is faster.
    case DESTROY_POST_SUCCESS:
      post = action.payload
      if (post.campaignId = state.id) {

        campaign = Object.assign({}, state)
        campaignPosts = [...campaign.posts]
        postIndex = _.findIndex(campaignPosts, (p) => p.id === post.id)


        //removes that item in the array
        campaignPosts.splice(postIndex, 1)
        campaign.posts = campaignPosts

        return Object.assign({}, state, campaign)

      } else {
        return state
      }


    case SIGN_OUT_SUCCESS:
      return null

    default:
      return state
  }
}

export default currentCampaignReducer

