import 'babel-polyfill'
import _ from 'lodash'
import { call, put, takeLatest, all } from 'redux-saga/effects'
import fbApp from 'firebaseApp.js'
import firebase  from 'firebase'
import { USER_FETCH_REQUEST, USER_FETCH_SUCCESS, IS_PRELOADING_STORE, USER_FETCH_FAILURE } from 'actions'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP } from 'constants'
import helpers from 'helpers'

const database = fbApp.database();

//retrieves user data from firebase if user exists, otherwise creates new user entry in firebase
function* getOrSaveUserData(pld) {
}

function* fetchData(action) {
}

export default function* fetchUserSaga() {
  yield takeLatest(USER_FETCH_REQUEST, fetchData)
}
