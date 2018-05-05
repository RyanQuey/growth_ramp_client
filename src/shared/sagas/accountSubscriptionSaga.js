import { call, put, select, takeLatest, all, throttle } from 'redux-saga/effects'
import {
  CHECK_STRIPE_STATUS_REQUEST,
  CHECK_STRIPE_STATUS_SUCCESS,
  REACTIVATE_ACCOUNT_SUBSCRIPTION_SUCCESS,
  REACTIVATE_ACCOUNT_SUBSCRIPTION_REQUEST,
  CANCEL_ACCOUNT_SUBSCRIPTION_SUCCESS,
  CANCEL_ACCOUNT_SUBSCRIPTION_REQUEST,
  CREATE_ACCOUNT_SUBSCRIPTION_SUCCESS,
  CREATE_ACCOUNT_SUBSCRIPTION_REQUEST,
  FETCH_ACCOUNT_SUBSCRIPTION_REQUEST,
  FETCH_ACCOUNT_SUBSCRIPTION_SUCCESS,
  HANDLE_CREDIT_CARD_INFO_REQUEST,
  INITIALIZE_USER_ACCOUNT_SUBSCRIPTION_REQUEST,
  UPDATE_ACCOUNT_SUBSCRIPTION_REQUEST,
  UPDATE_ACCOUNT_SUBSCRIPTION_SUCCESS,

} from 'constants/actionTypes'
import { errorActions, formActions, alertActions } from 'shared/actions';

//not using yet
/*function* find(action) {
  try {
    const accountSubscriptionId = action.payload

    let res = yield axios.get(`/api/accountSubscriptions/${accountSubscriptionId}/`)

    yield all([
      put({type: SET_CURRENT_ACCOUNT_SUBSCRIPTION, payload: res.data})
    ])

    action.cb && action.cb(res.data)

  } catch (err) {
    console.log('current account subscription fetch failed', err.response || err)
    // yield put(userFetchFailed(err.message))
  }
}*/

//refresh current plan, payment method data, etc
function* checkStripeStatus(action) {
  try {
    const user = store.getState().user

    let res = yield axios.get(`/api/accountSubscriptions/checkStripeStatus/${user.id}`)

    yield all([
      put({type: CHECK_STRIPE_STATUS_SUCCESS, payload: res.data})
    ])

    action.cb && action.cb(res.data)

  } catch (err) {
    console.log('current account subscription refresh failed', err.response || err)
    // yield put(userFetchFailed(err.message))
  }
}

//call this for every user if they don't have one already
function* initializeUserSubscription(action) {
  try {
    const user = store.getState().user
    let res, newRecord

    res = yield axios.post(`/api/accountSubscriptions/initializeForStripe/${user.id}`) //eventually switch to socket
    newRecord = res.data

    yield all([
      put({ type: CREATE_ACCOUNT_SUBSCRIPTION_SUCCESS, payload: newRecord}),
    ])
    action.cb && action.cb(newRecord)

  } catch (err) {
    action.onFailure && action.onFailure(err)
    console.log(`Error in Create accountSubscription Saga:`)
    console.error(err.response || err)
  }
}

//call this when they enter their credit card info
function* handleCreditCardInfo(action) {
console.log("starting request");
  try {
    const user = store.getState().user
console.log(action.payload);
    const res = yield axios.post(`/api/accountSubscriptions/handleCreditCardUpdate/${user.id}`, action.payload) //eventually switch to socket
console.log(res);
    const updatedRecord = res.data

    yield all([
      put({ type: UPDATE_ACCOUNT_SUBSCRIPTION_SUCCESS, payload: updatedRecord}),
    ])
    action.cb && action.cb(res.data)

  } catch (err) {
    action.onFailure && action.onFailure(err)
    console.log(`Error in Create accountsSubscription Saga:`)
    console.error(err.response || err)
  }
}

//NOTE: make sure to always attach the userId to the payload, for all updates. Saves a roundtrip for the api  :)
function* updateSubscription(action) {
  try {
    const pld = action.payload
    const {user, accountSubscription} = store.getState()
    const accountsSubscriptionData = Object.assign({}, pld, {id: accountSubscription.id, userId: user.id})

    let updatedRecord, res

    // updates our record and stripe, not just our record as a regular update would do
    res = yield axios.put(`/api/accountSubscriptions/updateSubscription`, accountsSubscriptionData)
    updatedRecord = res.data

    yield all([
      put({ type: UPDATE_ACCOUNT_SUBSCRIPTION_SUCCESS, payload: updatedRecord}),
    ])
    alertActions.newAlert({
      title: "Success!",
      message: "Successfully updated Account Subscription",
      level: "SUCCESS",
    })

    action.cb && action.cb(res.data)
  } catch (err) {
    console.log(`Error in update accountSubscription Saga`)
    action.onFailure && action.onFailure(err)
    console.log(err.response || err)
  }
}

function* cancel(action) {
  try {
    const user = store.getState().user
    let res, updatedRecord

    res = yield axios.post(`/api/accountSubscriptions/cancelStripeSubscription/${user.id}`) //eventually switch to socket
    updatedRecord = res.data
    yield all([
      put({ type: CANCEL_ACCOUNT_SUBSCRIPTION_SUCCESS, payload: updatedRecord}),
    ])
    action.cb && action.cb(updatedRecord)

  } catch (err) {
    action.onFailure && action.onFailure(err)
    console.log(`Error in Cancel accountSubscription Saga:`)
    console.error(err.response || err)
  }
}
function* reactivateAccount(action) {
  try {
    const user = store.getState().user
    let res, updatedRecord

    res = yield axios.post(`/api/accountSubscriptions/reactivateStripeSubscription/${user.id}`) //eventually switch to socket
    updatedRecord = res.data
    yield all([
      put({ type: UPDATE_ACCOUNT_SUBSCRIPTION_SUCCESS, payload: updatedRecord}),
    ])
    action.cb && action.cb(updatedRecord)

  } catch (err) {
    action.onFailure && action.onFailure(err)
    console.log(`Error in Cancel accountSubscription Saga:`)
    console.error(err.response || err)
  }
}

export default function* accountSubscriptionsSaga() {
  //yield takeLatest(FETCH_ACCOUNT_SUBSCRIPTION_REQUEST, find)
  yield takeLatest(CHECK_STRIPE_STATUS_REQUEST, checkStripeStatus)
  yield takeLatest(CANCEL_ACCOUNT_SUBSCRIPTION_REQUEST, cancel)
  yield takeLatest(REACTIVATE_ACCOUNT_SUBSCRIPTION_REQUEST, reactivateAccount)
  yield takeLatest(INITIALIZE_USER_ACCOUNT_SUBSCRIPTION_REQUEST, initializeUserSubscription)
  yield takeLatest(UPDATE_ACCOUNT_SUBSCRIPTION_REQUEST, updateSubscription)
  yield takeLatest(HANDLE_CREDIT_CARD_INFO_REQUEST, handleCreditCardInfo)
}

