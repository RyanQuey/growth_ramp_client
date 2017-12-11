import { put, select, take, takeLatest, call, all } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { PUBLISH_CAMPAIGN_REQUEST,
  SIGN_IN_POPUP_CLOSED,
  PUBLISH_CAMPAIGN_SUCCESS,
  SIGN_IN_REQUEST,
  CREATE_CAMPAIGN_SUCCESS,
  CREATE_CAMPAIGN_REQUEST,
  DESTROY_CAMPAIGN_REQUEST,
  DESTROY_CAMPAIGN_SUCCESS,
  FETCH_CAMPAIGN_REQUEST,
  FETCH_CAMPAIGN_SUCCESS,
  FETCH_CURRENT_CAMPAIGN_REQUEST,
  SET_CURRENT_CAMPAIGN,
  UPDATE_CAMPAIGN_REQUEST,
  UPDATE_CAMPAIGN_SUCCESS,
  USER_CAMPAIGNS_OUTDATED,
} from 'constants/actionTypes'
import { errorActions, formActions, alertActions } from 'shared/actions'

//so far, always creating blank; then goes to the edit view from there
function* createCampaign(action) {
  try {
    const pld = action.payload

    let blankCampaign = {
      title: "",
      content: "",
      status: "DRAFT",
      userId: pld.userId,
      planId: pld.planId, //might be undefined or null
    }

    const res = yield axios.post("/api/campaigns", blankCampaign) //eventually switch to socket
    const newRecord = res.data
    const campaignId = newRecord.id

    yield all([
      put({ type: CREATE_CAMPAIGN_SUCCESS, payload: newRecord}),
      //just handling in the reducer
      //put({type: USER_CAMPAIGNS_OUTDATED}),
    ])

    if (action.cb) {
      action.cb(newRecord)
    }

  } catch (err) {
    console.log(`Error in Create campaign Saga ${err}`)
    errorActions.handleErrors({
      templateName: "Campaign",
      templatePart: "create",
      title: "Error creating campaign",
      errorObject: err,
    })
  }
}

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
//Only want to retrieve this user's campaigns once...for now
//TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
function* fetchCampaigns(action) {
  try {
    const pld = action.payload || {}
    const userId = pld.userId || store.getState().user.id//making it so no reason to actually attach a payload...

    //TODO: eventually they filter out campaigns that have already been sent
    //also want to just retrieve a specific campaign sometimes...ie, be able to pass in criteria
    const res = yield axios.get(`/api/users/${userId}/campaigns`) //eventually switch to socket

    //converting into object
    const campaigns = res.data.reduce((acc, campaign) => {
      acc[campaign.id] = campaign
      return acc
    }, {})
    yield all([
      put({type: FETCH_CAMPAIGN_SUCCESS, payload: campaigns})
    ])

  } catch (err) {
    console.log('campaigns fetch failed', err)
    errorActions.handleErrors({
      templateName: "Campaign",
      templatePart: "fetch",
      title: "Error fetcing campaign(s)",
      errorObject: err,
    })
    // yield put(userFetchFailed(err.message))
  }
}

//NOTE: make sure to always attach the userId to the payload, for all updates. Saves a roundtrip for the api  :)
function* updateCampaign(action) {
  try {
    const campaignData = action.payload
    //not using currently
    //const currentRecord = store.getState().campaigns[campaignData.id]

    const res = yield axios.put(`/api/campaigns/${campaignData.id}`, campaignData) //eventually switch to socket
    const updatedRecord = Array.isArray(res.data) ? res.data[0] : res.data

    yield all([
      //assumes only updating one campaign
      put({ type: UPDATE_CAMPAIGN_SUCCESS, payload: updatedRecord}),
    ])
    action.cb && action.cb(updatedRecord)

  } catch (err) {
    console.log(`Error in update campaign Saga ${err}`)
    errorActions.handleErrors({
      templateName: "Campaign",
      templatePart: "update",
      title: "Error updating campaign",
      errorObject: err,
    })
  }
}

function* destroyCampaign(action) {
  try {
    const pld = action.payload

    //TODO: eventually they filter out campaigns that have already been sent
    const res = yield axios.put(`/api/campaigns/${pld.id}`, {status: "ARCHIVED"}) //eventually switch to socket

    yield all([
      put({type: DESTROY_CAMPAIGN_SUCCESS, payload: res}),
      put({type: USER_CAMPAIGNS_OUTDATED}),
    ])

    action.cb && action.cb(res)
  } catch (err) {
    console.log('campaigns destroy failed', err)
  }
}

//Gets all the populated data required for working on a single campaign
//or details like analytics, as the case may be
function* fetchCurrentCampaign(action) {
  try {
    const campaignId = action.payload

    let res
    if (action.options && action.options.getAnalytics) {
      res = yield axios.get(`/api/campaigns/${campaignId}/getAnalytics`)
    } else {
      res = yield axios.get(`/api/campaigns/${campaignId}?populate=posts`)
    }

    yield all([
      put({type: SET_CURRENT_CAMPAIGN, payload: res.data})
    ])

    action.cb && action.cb(res.data)

  } catch (err) {
    console.log('current campaign fetch failed', err.response || err)
    // yield put(userFetchFailed(err.message))
  }
}

function* publishCampaign(action) {
  let logins = 0
  try {
    const campaign = action.payload
    //mostly using this so UI has something to respond to
    formActions.setParams("Send", "submit", {publishing: true})

    //mark campaign as published
    const results = yield axios.post(`/api/campaigns/${campaign.id}/publish`)

    //parse results:
    const parsedResults = Helpers.parseCampaignResults(results.data)

    //although, there might have been failures, successfully did everything in the api
    yield put({type: PUBLISH_CAMPAIGN_SUCCESS, payload: {
      campaign: parsedResults.campaign,
      posts: parsedResults.posts,
    }})

    //or something to trigger next phase, to prompt saving plan
    formActions.formPersisted("Send", "submit")
    alertActions.newAlert({
      title: parsedResults.alertTitle,
      message: parsedResults.alertMessage,
      level: parsedResults.alertLevel,
      options: {
        timer: parsedResults.alertTimer,
      }
    })

    if (parsedResults.failedPosts.length) {
      action.onFailure && action.onFailure()

    } else {
      action.cb && action.cb(results.data)

    }

  } catch (err) {
    console.log(`Error publishing campaign: ${err}`)
    errorActions.handleErrors({
      templateName: "Campaign",
      templatePart: "published",
      title: "Error publishing campaign",
      errorObject: err,
    })

    action.onFailure && action.onFailure(err)
  }
}


export default function* campaignSaga() {
  yield takeLatest(FETCH_CURRENT_CAMPAIGN_REQUEST, fetchCurrentCampaign)
  yield takeLatest(FETCH_CAMPAIGN_REQUEST, fetchCampaigns)
  yield takeLatest(CREATE_CAMPAIGN_REQUEST, createCampaign)
  yield takeLatest(UPDATE_CAMPAIGN_REQUEST, updateCampaign)
  yield takeLatest(DESTROY_CAMPAIGN_REQUEST, destroyCampaign)
  yield takeLatest(PUBLISH_CAMPAIGN_REQUEST, publishCampaign)
  //when setting as the current campaign, will want to populate several of the associations
  //yield takeLatest(SET_CAMPAIGN, populateCampaign)
}


