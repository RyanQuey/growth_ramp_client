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
import {errorActions} from 'shared/actions'

function* sendToProvider(providerName, pld, tokenInfo) {
  const publishFunctions = {
    facebook: () => {
      /*FB.api(`/me/feed`, 'campaign', pld.campaign.message, (response) => {
        if (!response || response.error) {
          let newError = helpers.handleError(response.error);

        } else {
          alert('Facebook campaign ID: ' + response.id);
        }
      })*/
    },
    twitter: () => {
      tokenInfo.api.__call("statuses_update", {
        status: pld.campaign.content
      }, function(reply){
        console.log("Twitter Campaign Succeeded: ",reply)
      });
    },
    linkedin: () => {

    },
  }

console.log(providerName);
  publishFunctions[providerName]()
}

function* checkForToken(providerName, index, logins) {
  let tokenInfo = yield select(state => helpers.safeDataPath(state, `tokenInfo.${providerName}`, false))
  if (!tokenInfo.authenticated) {
    if (logins > 0) {
      //needs a button click; Twitter and perhaps Facebook, don't allow one to go after the other like this
      throw "Please login again with " + providerName
    }
    const data = {
      signInType: 'PROVIDER',
      provider: providerName.toUpperCase(),
      wantTokenOnly: true,
    }
    let a = yield put({type: SIGN_IN_REQUEST, payload: data})
    tokenInfo = yield select(state => helpers.safeDataPath(state, `tokens.${providerName}.accessToken`, false))
    yield take(SIGN_IN_POPUP_CLOSED)
    logins++
  }
  console.log("going for two fast", providerName);
  return {tokenInfo, logins}
}

function* publishCampaign(action) {
  let logins = 0
  try {
    const pld = action.payload
    for (let i = 0;i < pld.providers.length; i++) {
      const providerName = pld.providers[i]
      console.log("now starting ", providerName);
      //since I'm passing the token, another reason why this should be done in the backend

      let result = yield call(checkForToken, providerName, i, logins)
      let tokenInfo = result.tokenInfo
      logins = result.logins
      //make sync; can only have one pop up at a time
      //yield all, or promise all
      yield call(sendToProvider, providerName, pld, tokenInfo)
    }
    //mark campaign as published
    yield database.ref(`campaigns/${pld.campaign.id}/published`).set(true)
    yield put({type: PUBLISH_CAMPAIGN_SUCCESS, payload: {providers: pld.providers}})

  } catch (err) {
    console.log(`Error in Create campaign Saga ${err}`)
  }
}

function* createCampaign(action) {
  try {
    const pld = action.payload

    let blankCampaign = {
      title: "",
      content: "",
      status: "DRAFT",
      userId: pld.userId,
      planId: pld.planId, //might be undefined
    }

    const res = yield axios.post("/api/campaigns", blankCampaign) //eventually switch to socket
    const newRecord = res.data
    const campaignId = newRecord.id

    if (action.cb) {
      action.cb(newRecord)
    }
    yield all([
      put({ type: CREATE_CAMPAIGN_SUCCESS, payload: {[campaignId]: newRecord}}),
      //TODO especially when there are more campaigns, will want to just merge this one campaign to the campaigns list, rather than fetching all..
      put({type: USER_CAMPAIGNS_OUTDATED}),
    ])

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
    const currentRecord = store.getState().campaigns[campaignData.id]
    //not using currently
    //const options = action.options || {}

    if (campaignData.planId && campaignData.planId !== currentRecord.planId) {
      //TODO update campaign posts with new plan utms, but only if there is a plan set

    }

    const res = yield axios.put(`/api/campaigns/${campaignData.id}`, campaignData) //eventually switch to socket

    yield all([
      put({ type: UPDATE_CAMPAIGN_SUCCESS, payload: res.data}),
    ])
    action.cb && action.cb(res)

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
    const res = yield axios.delete(`/api/campaigns/${pld.id}`) //eventually switch to socket
    yield all([
      put({type: DESTROY_CAMPAIGN_SUCCESS, payload: res}),
      put({type: USER_CAMPAIGNS_OUTDATED}),
    ])

  } catch (err) {
    console.log('campaigns destroy failed', err)
  }
}

//Gets all the populated data required for working on a single campaign
function* fetchCurrentCampaign(action) {
  try {
    const campaignId = action.payload

    const res = yield axios.get(`/api/campaigns/${campaignId}?populate=posts`) //eventually switch to socket

    yield all([
      put({type: SET_CURRENT_CAMPAIGN, payload: res.data})
    ])
    action.cb && action.cb(res)

  } catch (err) {
    console.log('campaigns fetch failed', err.response)
    // yield put(userFetchFailed(err.message))
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


