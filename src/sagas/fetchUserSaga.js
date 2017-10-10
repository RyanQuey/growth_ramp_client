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
  const properties = _.values(USER_FIELDS_TO_PERSIST)

  const ref = database.ref(`users/${pld.uid}`)

  let userData
  yield ref.once('value', (snapshot) => {
    if (snapshot.val()) {
      //is no values retrieved from database, just return info from the payload
      userData = snapshot.val() || _.pick(pld, ...properties)

    } else {
      userData = _.pick(pld, ...properties)
      ref.set(userData)

      //TODO: probably will redirect to a page where they fill out more profile information, basically, signing up.
    }
  }, (err) => {
    helpers.handleError(`The user read failed: ${err.code}`)
    userData = {}
  })

  return userData
}

function* fetchData(action) {
  try {
    // action.payload is all the data firebase returns from logging in

    const pld = action.payload
    // can persist all except credential (pld.credential)
    let userData = yield call(getOrSaveUserData, pld)

    const user = Object.assign({}, userData, {uid: pld.uid})
    yield put({type: USER_FETCH_SUCCESS, payload: user})
    //not really preloading yet. this breaks it also
    yield put({type: IS_PRELOADING_STORE, payload: {preloadingData: false}})

    /* don't have anywhere to redirect to yet!
    if (action.payload.redirect) {
      // helpful way to track where a user has been
      action.user.history.push('')
    }
    */

  } catch (err) {
    console.log('user fetch failed', err)
    yield put({type: IS_PRELOADING_STORE, payload: {preloadingData: false}})
    yield put({type: USER_FETCH_FAILURE, payload: err.message})
  }
}

export default function* fetchUserSaga() {
  yield takeLatest(USER_FETCH_REQUEST, fetchData)
}
