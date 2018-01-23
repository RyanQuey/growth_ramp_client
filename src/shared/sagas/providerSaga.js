import { call, put, takeLatest, takeEvery, all, fork, join } from 'redux-saga/effects'
import {
  UPDATE_PROVIDER_REQUEST,
  UPDATE_PROVIDER_FAILURE,
  UPDATE_PROVIDER_SUCCESS,
  REFRESH_CHANNEL_TYPE_REQUEST,
  REFRESH_CHANNEL_TYPE_SUCCESS,
  FETCH_CURRENT_ACCOUNT_REQUEST,
  FETCH_CURRENT_ACCOUNT_SUCCESS,
  FETCH_PROVIDER_REQUEST,
  FETCH_PROVIDER_SUCCESS,
} from 'constants/actionTypes'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP  } from 'constants'

//disabling environment variables in the front-end; so remove this  ||  when this gets moved to the backend. I will want to throw an error at that point
const providerInfo = {}

//called when there is no provider in the store (e.g., initial store load), or expired provider in the store

function* fetchAllAccounts(action) {
  try {
    const userId = store.getState().user.id
    const res = yield axios.get(`/api/users/${userId}/providerAccounts?populate=channels`)

    //organize by provider
    const sortedAccounts = Helpers.sortAccounts(res.data)

    yield all([
      put({type: FETCH_PROVIDER_SUCCESS, payload: sortedAccounts})
    ])

    action.cb && action.cb(res)

  } catch (err) {
    console.log('all accounts fetch failed', err.response || err)
    // yield put(userFetchFailed(err.message))
  }
}

//Gets all the populated data required for working on a single campaign
function* fetchCurrentAccount(action) {
  try {
    const accountId = action.payload.id

    const res = yield axios.get(`/api/providerAccounts/${accountId}?populate=channels`) //eventually switch to socket

    yield all([
      put({type: SET_CURRENT_ACCOUNT, payload: res.data})
    ])
    action.cb && action.cb(res)

  } catch (err) {
    console.log('current account fetch failed', err.response || err)
    // yield put(userFetchFailed(err.message))
  }
}

function* updateData(action) {
  try {
    // action.payload is an object: {providerIds: ['facebook.com',], credential: {provider: '...'}}
    // only gets a credential if this action was called from the signInSaga
    const pld = action.payload

    // can persist all except credential (pld.credential)
    if (pld.providerIds) {
      let tasks = []
      for (let providerId of pld.providerIds) {
        //let task = yield fork(getproviders, providerId, pld.credential)
        tasks.push(task)
      }
      // wait for all of the tasks to finish
      yield join(...tasks)
    }


    const providers = Object.assign({}, providerInfo)

    yield put({type: UPDATE_PROVIDER_SUCCESS, payload: providers})
  } catch (err) {
    console.log('provider update failed', err)
    yield put({type: UPDATE_PROVIDER_FAILURE, payload: err.message})
  }
}
function* refreshChannelType(action) {
  try {
    // action.payload is an object: {providerIds: ['facebook.com',], credential: {provider: '...'}}
    // only gets a credential if this action was called from the signInSaga
    const pld = action.payload
    if (!pld.account || !pld.channelType) {
      throw "need account and channeltype"
    }

    const res = yield axios.post(`/api/providerAccounts/${pld.account.id}/refreshChannelType`, {channelType: pld.channelType})

    yield put({type: REFRESH_CHANNEL_TYPE_SUCCESS, payload: res.data})

    action.cb && action.cb()

  } catch (err) {
    console.log('provider update failed', err.response || err)
    yield put({type: UPDATE_PROVIDER_FAILURE, payload: err.message})
  }
}


export default function* updateProviderSaga() {
  yield takeLatest(UPDATE_PROVIDER_REQUEST, updateData)
  yield takeEvery(REFRESH_CHANNEL_TYPE_REQUEST, refreshChannelType)
  yield takeLatest(FETCH_CURRENT_ACCOUNT_REQUEST, fetchCurrentAccount)
  yield takeLatest(FETCH_PROVIDER_REQUEST, fetchAllAccounts)

}
