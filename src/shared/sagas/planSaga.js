import { call, put, select, takeLatest, all } from 'redux-saga/effects'
import {
  CREATE_PLAN_SUCCESS, CREATE_PLAN_REQUEST, CHOOSE_PLAN, FETCH_PLAN_REQUEST, FETCH_PLAN_SUCCESS,
  UPDATE_PLAN_REQUEST,
  UPDATE_PLAN_SUCCESS,
} from 'constants/actionTypes'

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
function* _getPlans(userId){
  //Only want to retrieve this user's plans once...for now
  //TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
  let plans
  //TODO: eventually they filter out plans that have already been sent
  /*yield database.ref(`plans`).orderByChild('userId').equalTo(userId).once("value", (snapshot) => {
    plans = snapshot.val() || []
  }, (err) => {
    Helpers.handleError(`The plans read failed: ${err.code}`)
    plans = []
  })*/

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
    console.log('plans fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}

function* create(action) {
  try {
    const pld = action.payload

    const newPlan = {
      posts: [],
      channels: [],
      providers: [],
      createdAt: moment().format(),
      name: pld.name || "",
      utmOptions: {},
      userId: pld.userId,
    }
console.log(newPlan);
    const res = yield axios.post("/api/plans", newPlan) //eventually switch to socket
    const newRecord = res.data
    const planId = newRecord.id

    yield all([
      put({ type: CREATE_PLAN_SUCCESS, payload: {[planId]: newRecord }}),
      put({ type: CHOOSE_PLAN, payload: newRecord }),
    ])

  } catch (err) {
    console.log(`Error in Create plan Saga ${err}`)
  }
}

function* update(action) {
  try {
    const planData = action.payload

    const res = yield axios.put(`/api/plans/${planData.id}`, planData) //eventually switch to socket

    yield all([
      put({ type: UPDATE_PLAN_SUCCESS, payload: planData}),
    ])

  } catch (err) {
    console.log(`Error in update plan Saga ${err}`)
  }
}
export default function* planSagas() {
  yield takeLatest(FETCH_PLAN_REQUEST, find)
  yield takeLatest(CREATE_PLAN_REQUEST, create)
  yield takeLatest(UPDATE_PLAN_REQUEST, update)
}

