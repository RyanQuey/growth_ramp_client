import { call, put, select, takeLatest, all, throttle } from 'redux-saga/effects'
import {
  DESTROY_WORKGROUP_REQUEST,
  DESTROY_WORKGROUP_SUCCESS,
  CREATE_WORKGROUP_SUCCESS,
  CREATE_WORKGROUP_REQUEST,
  SET_CURRENT_WORKGROUP,
  FETCH_WORKGROUP_REQUEST,
  FETCH_WORKGROUP_SUCCESS,
  UPDATE_WORKGROUP_REQUEST,
  UPDATE_WORKGROUP_SUCCESS,
} from 'constants/actionTypes'

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
function* find(action) {
  try {
    const pld = action.payload || {}
    const ownerId = pld.ownerId || store.getState().user.id//making it so no reason to actually attach a payload...

//make actual route probably...
    const res = yield axios.get(`/api/workgroups`, {params: {ownerId}}) //eventually switch to socket

    //converting into object
    const workgroups = res.data.reduce((acc, workgroup) => {
      acc[workgroup.id] = workgroup
      return acc
    }, {})
    yield all([
      put({type: FETCH_WORKGROUP_SUCCESS, payload: workgroups})
    ])

  } catch (err) {
    console.log('workgroups fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}

function* create(action) {
  try {
    const pld = action.payload

    const newWorkgroup = {
      name: pld.name || "",
      ownerId: pld.ownerId,
    }

    const res = yield axios.post("/api/workgroups", newWorkgroup) //eventually switch to socket
    const newRecord = res.data

    yield all([
      put({ type: CREATE_WORKGROUP_SUCCESS, payload: newRecord}),
    ])

    if (action.cb) {
      action.cb(newRecord)
    }

  } catch (err) {
    console.log(`Error in Create workgroup Saga ${err}`)
  }
}

//NOTE: make sure to always attach the userId to the payload, for all updates. Saves a roundtrip for the api  :)
function* update(action) {
  try {
    const workgroupData = action.payload

    const res = yield axios.put(`/api/workgroups/${workgroupData.id}`, workgroupData) //eventually switch to socket

    yield all([
      put({ type: UPDATE_WORKGROUP_SUCCESS, payload: workgroupData}),
    ])

  } catch (err) {
    console.log(`Error in update workgroup Saga ${err}`)
  }
}

function* destroy(action) {
  try {
    const workgroupData = action.payload

    const res = yield axios.delete(`/api/workgroups/${workgroupData.id}`) //eventually switch to socket

    yield all([
      put({ type: DESTROY_WORKGROUP_SUCCESS, payload: workgroupData}),
    ])

  } catch (err) {
    console.log(`Error in destroy workgroup Saga ${err}`)
  }
}

export default function* workgroupSagas() {
  yield takeLatest(FETCH_WORKGROUP_REQUEST, find)
  yield takeLatest(CREATE_WORKGROUP_REQUEST, create)
  yield takeLatest(UPDATE_WORKGROUP_REQUEST, update)
  yield takeLatest(DESTROY_WORKGROUP_REQUEST, destroy)

}

