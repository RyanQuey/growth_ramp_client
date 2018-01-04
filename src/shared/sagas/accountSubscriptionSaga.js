import { call, put, select, takeLatest, all, throttle } from 'redux-saga/effects'
import {
  CREATE_ACCOUNT_SUBSCRIPTION_SUCCESS,
  CREATE_ACCOUNT_SUBSCRIPTION_REQUEST,
  FETCH_ACCOUNT_SUBSCRIPTION_REQUEST,
  FETCH_ACCOUNT_SUBSCRIPTION_SUCCESS,
  HANDLE_CREDIT_CARD_INFO_REQUEST,
  INITIALIZE_USER_ACCOUNT_SUBSCRIPTION_REQUEST,
  UPDATE_ACCOUNT_SUBSCRIPTION_REQUEST,
  UPDATE_ACCOUNT_SUBSCRIPTION_SUCCESS,

} from 'constants/actionTypes'
import { errorActions, formActions, alertActions } from 'shared/actions'

function* find(action) {
  try {
    const accountsSubscriptionId = action.payload

    let res = yield axios.get(`/api/accountsSubscriptions/${accountsSubscriptionId}/`)

    yield all([
      put({type: SET_CURRENT_ACCOUNT_SUBSCRIPTION, payload: res.data})
    ])

    action.cb && action.cb(res.data)
    formActions.matchPlanStateToRecord()

  } catch (err) {
    console.log('current campaign fetch failed', err.response || err)
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
    console.log(`Error in Create accountsSubscription Saga:`)
    console.error(err.response || err)
  }
}

//call this when they enter their credit card info
function* handleCreditCardInfo(action) {
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
function* update(action) {
  try {
    const pld = action.payload
    const accountsSubscriptionData = pld

    let updatedRecord, res

      res = yield axios.put(`/api/accountsSubscriptions/${accountsSubscriptionData.id}`, accountsSubscriptionData)
      updatedRecord = res.data

    yield all([
      put({ type: UPDATE_ACCOUNT_SUBSCRIPTION_SUCCESS, payload: updatedRecord}),
    ])
    alertActions.newAlert({
      title: "Success!",
      message: "Successfully updated accountsSubscription",
      level: "SUCCESS",
    })

    action.cb && action.cb(res.data)
  } catch (err) {
    console.log(`Error in update accountsSubscription Saga`)
    console.log(err.response || err)
  }
}

export default function* accountSubscriptionsSaga() {
  yield takeLatest(FETCH_ACCOUNT_SUBSCRIPTION_REQUEST, find)
  //will use for workgroups maybe
  //yield takeLatest(CREATE_ACCOUNT_SUBSCRIPTION_REQUEST, create)
  yield takeLatest(INITIALIZE_USER_ACCOUNT_SUBSCRIPTION_REQUEST, initializeUserSubscription)
  yield takeLatest(UPDATE_ACCOUNT_SUBSCRIPTION_REQUEST, update)
  yield takeLatest(HANDLE_CREDIT_CARD_INFO_REQUEST, handleCreditCardInfo)
}

