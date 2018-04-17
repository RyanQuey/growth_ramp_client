import { put, select, take, takeLatest, takeEvery, call, all } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import {
  CREATE_CUSTOM_LIST_SUCCESS,
  CREATE_CUSTOM_LIST_REQUEST,
  FETCH_CUSTOM_LIST_REQUEST,
  FETCH_CUSTOM_LIST_SUCCESS,
  SET_CURRENT_CUSTOM_LIST,
  UPDATE_CUSTOM_LIST_REQUEST,
  UPDATE_CUSTOM_LIST_SUCCESS,
} from 'constants/actionTypes'
import {errorActions, formActions} from 'shared/actions'

function* createCustomList(action) {
  try {
    const customList = action.payload

    const res = yield axios.post("/api/customLists", customList) //eventually switch to socket

    const newRecord = res.data
    const customListId = newRecord.id

    yield all([
      put({ type: CREATE_CUSTOM_LIST_SUCCESS, payload: newRecord}),
      //TODO especially when there are more customLists, will want to just merge this one customList to the customLists list, rather than fetching all..
    ])
    if (action.cb) {
      action.cb(newRecord)
    }

  } catch (err) {
    if (action.onFailure) {
      action.onFailure(err)
    }
    console.log(`Error in Create customList Saga ${err}`)
    errorActions.handleErrors({
      templateName: "CustomList",
      templatePart: "create",
      title: "Error creating customList",
      errorObject: err,
    })
  }
}

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
//Only want to retrieve this user's customLists once...for now
//TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
function* fetchCustomLists(action) {
  try {
    const pld = action.payload || {}
    const userId = pld.userId || store.getState().user.id//making it so no reason to actually attach a payload...
    const params = Object.assign({}, pld, {userId, status: "ACTIVE"})

    const query = Helpers.toQueryString(params)
    const res = yield axios.get(`/api/customLists?${query}`) //eventually switch to socket

    //converting into object
    const customLists = res.data.reduce((acc, customList) => {
      acc[customList.id] = customList
      return acc
    }, {})

    yield all([
      put({type: FETCH_CUSTOM_LIST_SUCCESS, payload: customLists})
    ])

  } catch (err) {
    console.log('customLists fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}

//NOTE: make sure to always attach the userId to the payload, for all updates. Saves a roundtrip for the api  :)
function* updateCustomList(action, cb) {
  try {
    const customListData = action.payload

    const res = yield axios.put(`/api/customLists/${customListData.id}`, customListData) //eventually switch to socket

    yield all([
      put({ type: UPDATE_CUSTOM_LIST_SUCCESS, payload: res.data}),
    ])

    if (action.cb) {
      action.cb(res.data)
    }

  } catch (err) {
    console.log(err.response);
    console.log(`Error in update customList Saga ${err}`)
  }
}

function* destroyCustomList(action) {
  try {
    const pld = action.payload

    //TODO: eventually they filter out customLists that have already been sent
    const res = yield axios.delete(`/api/customLists/${pld.id}`) //eventually switch to socket
    yield all([
      put({type: DESTROY_CUSTOM_LIST_SUCCESS, payload: res.data}),
    ])

    if (action.cb) {
      action.cb(res.data) //passing in destroyed record
    }

  } catch (err) {
    console.log('customLists destroy failed', err)
  }
}

//Gets all the populated data required for working on a single customList
function* fetchCurrentCustomList(action) {
  try {
    const customListId = action.payload

    const res = yield axios.get(`/api/customLists/${customListId}`) //eventually switch to socket

    yield all([
      put({type: SET_CURRENT_CUSTOM_LIST, payload: res.data})
    ])

  } catch (err) {
    console.log('customLists fetch failed', err.response)
    // yield put(userFetchFailed(err.message))
  }
}


export default function* customListSaga() {
  yield takeLatest(FETCH_CUSTOM_LIST_REQUEST, fetchCustomLists)
  yield takeEvery(CREATE_CUSTOM_LIST_REQUEST, createCustomList)
  yield takeEvery(UPDATE_CUSTOM_LIST_REQUEST, updateCustomList)
}


