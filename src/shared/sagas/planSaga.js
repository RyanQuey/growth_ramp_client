import { call, put, select, takeLatest, all, throttle } from 'redux-saga/effects'
import {
  ARCHIVE_PLAN_REQUEST,
  ARCHIVE_PLAN_SUCCESS,
  CREATE_PLAN_SUCCESS,
  CREATE_PLAN_REQUEST,
  SET_CURRENT_PLAN,
  FETCH_CURRENT_PLAN_REQUEST,
  FETCH_PLAN_REQUEST,
  FETCH_PLAN_SUCCESS,
  UPDATE_PLAN_REQUEST,
  UPDATE_PLAN_SUCCESS,
  UPDATE_POST_REQUEST,
  LIVE_UPDATE_PLAN_REQUEST,
  LIVE_UPDATE_PLAN_SUCCESS,
  LIVE_UPDATE_PLAN_FAILURE,
  UPDATE_CAMPAIGN_SUCCESS,
} from 'constants/actionTypes'
import { errorActions, formActions, alertActions } from 'shared/actions'

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
function* _getPlans(userId){
  //Only want to retrieve this user's plans once...for now
  //TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
  let plans

  return plans
}

function* find(action) {
  try {
    const pld = action.payload
    const userId = pld.uid

    const plansData = yield call(_getPlans, userId)
    const plans = Object.assign({}, plansData)

    yield all([
      put({type: FETCH_PLAN_SUCCESS, payload: plans}),
    ])

  } catch (err) {
    console.log('plans fetch failed')
    console.log(err.response || err)
    // yield put(userFetchFailed(err.message))
  }
}

function* create(action) {
  try {
    const pld = action.payload

    const newPlan = {
      name: pld.name || "",
      utmOptions: {},
      userId: store.getState().user.id,
    }

    let associatedCampaign = pld.associatedCampaign

    let res, newRecord

    if (associatedCampaign) {
      newPlan.associatedCampaign = associatedCampaign

      res = yield axios.post("/api/plans/createFromCampaign", newPlan) //eventually switch to socket
      newRecord = res.data.newPlan
      let updatedCampaign = res.data.updatedCampaign

      store.dispatch({
        type: UPDATE_CAMPAIGN_SUCCESS,
        payload: Object.assign({}, updatedCampaign)
      })
      //posts on that campaign are currently outdated in that they have new plan id; have been updated in api, and returned to browser, but not doing anything in redux
      //will get refreshed when campaign gets opened anyways.

    } else {
      res = yield axios.post("/api/plans", newPlan) //eventually switch to socket
      newRecord = res.data
    }

    yield all([
      put({ type: CREATE_PLAN_SUCCESS, payload: newRecord}),
    ])

    alertActions.newAlert({
      title: "Success!",
      message: "Successfully created plan",
      level: "SUCCESS",
    })
    action.cb && action.cb(newRecord)

  } catch (err) {
    alertActions.newAlert({
      title: "Error:",
      message: "Failed to create plan",
      level: "DANGER",
    })

    action.onFailure && action.onFailure(err)
    console.log(`Error in Create plan Saga:`)
    console.log(err.response || err)
  }
}

//NOTE: make sure to always attach the userId to the payload, for all updates. Saves a roundtrip for the api  :)
function* update(action) {
  try {
    const pld = action.payload
    const planData = pld
    let associatedCampaign = pld.associatedCampaign
    delete pld.associatedCampaign

    let updatedRecord, res


    if (associatedCampaign) {
      //saving over campaign's plan. Only changes the postTemplates
      planData.associatedCampaign = associatedCampaign

      res = yield axios.post("/api/plans/updateFromCampaign", planData)
      updatedRecord = res.data.plan

    } else {
      res = yield axios.put(`/api/plans/${planData.id}`, planData)
      updatedRecord = res.data
    }

    yield all([
      put({ type: UPDATE_PLAN_SUCCESS, payload: updatedRecord}),
    ])
    alertActions.newAlert({
      title: "Success!",
      message: "Successfully updated plan",
      level: "SUCCESS",
    })

    action.cb && action.cb(res.data)
  } catch (err) {
    console.log(`Error in update plan Saga`)
    console.log(err.response || err)
  }
}

function* archive(action) {
  try {
    const planData = action.payload

    const res = yield axios.put(`/api/plans/${planData.id}`, {userId: planData.userId, status: "ARCHIVED"}) //eventually switch to socket

    yield all([
      put({ type: ARCHIVE_PLAN_SUCCESS, payload: planData}),
    ])

    action.cb && action.cb(planData)

  } catch (err) {
    console.log(`Error in archive plan Saga`)
    console.log(err.response || err)
  }
}

//Gets all the populated data required for working on a single campaign
//and details like analytics (show and edit view are more closely related, so get all the data at once, no matter what)
function* fetchCurrentPlan(action) {
  try {
    const planId = action.payload

    let res = yield axios.get(`/api/plans/fetchPopulatedPlan/${planId}/`) //?populate=postTemplates&populate=campaigns`)

    yield all([
      put({type: SET_CURRENT_PLAN, payload: res.data})
    ])

    action.cb && action.cb(res)
    formActions.matchPlanStateToRecord()

  } catch (err) {
    console.log('current campaign fetch failed', err.response || err)
    // yield put(userFetchFailed(err.message))
  }
}

function* liveUpdate(action) {
  try {
    const planData = action.payload

    const res = yield axios.put(`/api/plans/${planData.id}`, planData) //eventually switch to socket

    yield all([
      //NOTE: will not update the plan reducer; leave that to the form itself, will mess things up b/c async
      put({ type: LIVE_UPDATE_PLAN_SUCCESS, payload: planData}),
    ])

  } catch (err) {
    console.log(`Error in update plan Saga ${err}`)
    yield all([
      put({ type: LIVE_UPDATE_PLAN_FAILURE, payload: planData}),
    ])
  }
}
export default function* planSagas() {
  yield takeLatest(FETCH_PLAN_REQUEST, find)
  yield takeLatest(FETCH_CURRENT_PLAN_REQUEST, fetchCurrentPlan)
  yield takeLatest(CREATE_PLAN_REQUEST, create)
  yield takeLatest(UPDATE_PLAN_REQUEST, update)
  yield takeLatest(ARCHIVE_PLAN_REQUEST, archive)
  yield throttle(500, LIVE_UPDATE_PLAN_REQUEST, liveUpdate)

}

