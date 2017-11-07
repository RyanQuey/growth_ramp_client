import { call, put, select, takeLatest, all, throttle } from 'redux-saga/effects'
import {
  DESTROY_PERMISSION_REQUEST,
  DESTROY_PERMISSION_SUCCESS,
  CREATE_PERMISSION_SUCCESS,
  CREATE_PERMISSION_REQUEST,
  SET_CURRENT_PERMISSION,
  FETCH_PERMISSION_REQUEST,
  FETCH_PERMISSION_SUCCESS,
  UPDATE_PERMISSION_REQUEST,
  UPDATE_PERMISSION_SUCCESS,
} from 'constants/actionTypes'

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
function* _getPermissions(userId){
  //Only want to retrieve this user's permissions once...for now
  //TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
  let permissions

  return permissions
}

function* find(action) {
  try {
    const pld = action.payload
    const userId = pld.uid

    const permissionsData = yield call(_getPermissions, userId)
    const permissions = Object.assign({}, permissionsData)

    yield all([
      put({type: FETCH_PERMISSION_SUCCESS, payload: permissions}),
    ])

  } catch (err) {
    console.log('permissions fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}

function* create(action) {
  try {
    const pld = action.payload

    const newPermission = {
      posts: [],
      channels: [],
      providers: [],
      createdAt: moment().format(),
      name: pld.name || "",
      utmOptions: {},
      userId: pld.userId,
    }

    const res = yield axios.post("/api/permissions", newPermission) //eventually switch to socket
    const newRecord = res.data
    const permissionId = newRecord.id

    yield all([
      put({ type: CREATE_PERMISSION_SUCCESS, payload: {[permissionId]: newRecord }}),
      put({ type: SET_CURRENT_PERMISSION, payload: newRecord }),
    ])

  } catch (err) {
    console.log(`Error in Create permission Saga ${err}`)
  }
}

//NOTE: make sure to always attach the userId to the payload, for all updates. Saves a roundtrip for the api  :)
function* update(action) {
  try {
    const permissionData = action.payload

    const res = yield axios.put(`/api/permissions/${permissionData.id}`, permissionData) //eventually switch to socket

    yield all([
      put({ type: UPDATE_PERMISSION_SUCCESS, payload: permissionData}),
    ])

  } catch (err) {
    console.log(`Error in update permission Saga ${err}`)
  }
}

function* destroy(action) {
  try {
    const permissionData = action.payload

    const res = yield axios.delete(`/api/permissions/${permissionData.id}`) //eventually switch to socket

    yield all([
      put({ type: DESTROY_PERMISSION_SUCCESS, payload: permissionData}),
    ])

  } catch (err) {
    console.log(`Error in destroy permission Saga ${err}`)
  }
}

export default function* permissionSagas() {
  yield takeLatest(FETCH_PERMISSION_REQUEST, find)
  yield takeLatest(CREATE_PERMISSION_REQUEST, create)
  yield takeLatest(UPDATE_PERMISSION_REQUEST, update)
  yield takeLatest(DESTROY_PERMISSION_REQUEST, destroy)

}

