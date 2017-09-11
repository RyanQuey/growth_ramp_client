import 'babel-polyfill'
import _ from 'lodash'
import { call, put, takeLatest, all } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { PLAN_FETCH_REQUEST, PLAN_FETCH_SUCCESS } from '../actions'
import helpers from '../helpers'

const database = fbApp.database();

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
function* getPlans(userId){
  //Only want to retrieve this user's plans once...for now
  //TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
  let plans 
  //TODO: eventually they filter out plans that have already been sent
  yield database.ref(`plans`).orderByChild('userId').equalTo(userId).once("value", (snapshot) => {
    plans = snapshot.val() || []
  }, (err) => {
    helpers.handleError(`The plans read failed: ${err.code}`)
    plans = []
  })

  return plans
}

function* fetchData(action) {
  try {
    const pld = action.payload
    const userId = pld.uid

    const plansData = yield call(getPlans, userId)
    const plans = Object.assign({}, plansData)

    yield all([
      put({type: PLAN_FETCH_SUCCESS, payload: plans}),
    ])

  } catch (err) {
    console.log('plans fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}

export default function* fetchPlansSaga() {
  yield takeLatest(PLAN_FETCH_REQUEST, fetchData)
}
