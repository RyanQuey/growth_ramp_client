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

//either the campaign worked on in the EditCampaign template, or viewing details of in the ShowCampaign modal
const currentCampaignReducer = (state = null, action) => {

  let campaign, post, campaignPosts, oldPosts, postIndex
  let pld = action.payload
  switch (action.type) {
    case UPDATE_CAMPAIGN_SUCCESS:
      if (state && state.id === pld.id) {
        campaign = action.payload
        //merge into state, in case the new one doesn't have posts populated...which happens when create plan from campaign
        return Object.assign({}, state, campaign)
      } else {
        return state
      }

    case PUBLISH_CAMPAIGN_SUCCESS:
      campaign = pld.campaign
      if (campaign.id === state.id) {
        return Object.assign({}, state, campaign)

      } else {
        return state
      }

    case SET_CURRENT_CAMPAIGN:
      campaign = action.payload
      return Object.assign({}, campaign)

    case CREATE_POST_SUCCESS:
      post = action.payload
      if (post.campaignId === state.id) {
        campaign = Object.assign({}, state)
        oldPosts = campaign.posts || []
        campaignPosts = [...oldPosts]
        campaignPosts.push(post)
        campaign.posts = campaignPosts

        return Object.assign({}, campaign)

      } else {
        return state
      }

    //NOTE might be easier to just retrieve campaign from db again...but this is faster.
    case UPDATE_POST_SUCCESS:
      post = action.payload
      if (post.campaignId === (state && state.id)) {
        campaign = Object.assign({}, state)
        oldPosts = campaign.posts || []
        campaignPosts = [...oldPosts]
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
        campaignPosts = [...(campaign.posts || [])]
        postIndex = _.findIndex(campaignPosts, (p) => p.id === post.id)
console.log(postIndex, post);
console.log(campaignPosts[postIndex]);
        //removes that item in the array
        let deletedPost = campaignPosts.splice(postIndex, 1)
console.log(deletedPost);
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

