import {
  CREATE_POST_SUCCESS,
  UPDATE_POST_SUCCESS,
  DESTROY_POST_SUCCESS,
  CREATE_CAMPAIGN_SUCCESS,
  UPDATE_CAMPAIGN_SUCCESS,
  FETCH_CAMPAIGN_SUCCESS,
  SIGN_OUT_SUCCESS,
  SET_CURRENT_CAMPAIGN,
  PUBLISH_CAMPAIGN_SUCCESS,
} from 'constants/actionTypes'

const campaignsReducer = (state = {}, action) => {

  let campaign, post, campaignPosts, oldPosts, postIndex
  let pld = action.payload
  switch (action.type) {

    case SET_CURRENT_CAMPAIGN:
      campaign = action.payload
      return Object.assign({}, state, {[campaign.id]: action.payload})

    case FETCH_CAMPAIGN_SUCCESS:
      return Object.assign({}, action.payload)

    case CREATE_CAMPAIGN_SUCCESS:
      return Object.assign({}, state, {[pld.id]: pld})

    //assumes only updating one campaign
    case UPDATE_CAMPAIGN_SUCCESS:
      campaign = action.payload
      return Object.assign({}, state, {[campaign.id]: campaign})

    case PUBLISH_CAMPAIGN_SUCCESS:
      campaign = pld.campaign

      return Object.assign({}, state, {[campaign.id]: campaign})

    case CREATE_POST_SUCCESS:
      post = action.payload
      //should never be {}...
      campaign = Object.assign({}, Helpers.safeDataPath(store.getState(), `campaigns.${post.campaignId}`, {}))
      oldPosts = campaign.posts || []
      campaignPosts = [...oldPosts]
      campaignPosts.push(post)
      campaign.posts = campaignPosts

      return Object.assign({}, state, {[campaign.id]: campaign})

    //NOTE might be easier to just retrieve campaign from db again...but this is faster.
    case UPDATE_POST_SUCCESS:
      post = action.payload
      //should never be {}...
      campaign = Object.assign({}, Helpers.safeDataPath(store.getState(), `campaigns.${post.campaignId}`, {}))
      oldPosts = campaign.posts || []
      campaignPosts = [...oldPosts]
      postIndex = _.findIndex(campaignPosts, {id: post.id})
      //replaces that item in the array
      campaignPosts.splice(postIndex, 1, post)
      campaign.posts = campaignPosts

      return Object.assign({}, state, {[campaign.id]: campaign})

    //NOTE might be easier to just retrieve campaign from db again...but this is faster.
    case DESTROY_POST_SUCCESS:
      post = action.payload
      //should never be {}...
      campaign = Object.assign({}, Helpers.safeDataPath(store.getState(), `campaigns.${post.campaignId}`, {}))
      campaignPosts = [...campaign.posts]
      postIndex = _.findIndex(campaignPosts, {id: post.id})
      //replaces that item in the array
      campaignPosts.splice(postIndex, 1)
      campaign.posts = campaignPosts

      return Object.assign({}, state, {[campaign.id]: campaign})

    case SIGN_OUT_SUCCESS:
      return {}

    default:
      return state
  }
}

export default campaignsReducer

