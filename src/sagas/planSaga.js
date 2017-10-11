import { call, put, select, takeLatest, all } from 'redux-saga/effects'
import { CREATE_PLAN_SUCCESS, CREATE_PLAN_REQUEST, CHOOSE_PLAN, FETCH_PLAN_REQUEST, FETCH_PLAN_SUCCESS  } from 'constants/actionTypes'

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
function* create(action) {
  try {
    const pld = action.payload

    const planId = helpers.uniqueId()
    const newPlan = {
      posts: [],
      channels: [],
      providers: [],
      createdAt: moment().format(),
      name: pld.name || "",
      utmOptions: {},
      userId: pld.userId,
      id: planId,
    }
    //database.ref(`plans/${planId}`).set(newPlan);

    let relationEntry = {}
    relationEntry[planId] = true;
    //yield database.ref(`users/${pld.userId}/plans`).set(relationEntry)

    pld.plan = {[planId]: newPlan}
    yield all([
      put({ type: CREATE_PLAN_SUCCESS, payload: {[planId]: newPlan }}),
      put({ type: CHOOSE_PLAN, payload: newPlan }),
    ])

  } catch (err) {
    console.log(`Error in Create plan Saga ${err}`)
  }
}

function* getPlans(userId){
  //Only want to retrieve this user's plans once...for now
  //TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
  let plans
  //TODO: eventually they filter out plans that have already been sent
  /*yield database.ref(`plans`).orderByChild('userId').equalTo(userId).once("value", (snapshot) => {
    plans = snapshot.val() || []
  }, (err) => {
    helpers.handleError(`The plans read failed: ${err.code}`)
    plans = []
  })*/

  return plans
}

function* fetchData(action) {
  try {
    const pld = action.payload
    const userId = pld.uid

    const plansData = yield call(getPlans, userId)
    const plans = Object.assign({}, plansData)

    yield all([
      put({type: FETCH_PLAN_SUCCESS, payload: plans}),
    ])

  } catch (err) {
    console.log('plans fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}

export default function* planSagas() {
  yield takeLatest(CREATE_PLAN_REQUEST, create)
  yield takeLatest(FETCH_PLAN_REQUEST, fetchData)
}

