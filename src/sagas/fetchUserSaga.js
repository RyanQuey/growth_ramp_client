import 'babel-polyfill'
import _ from 'lodash'
import { call, put, takeLatest, all } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { isPreloadingStore, userFetchFailed, userFetchSucceeded } from '../actions'
import { USER_FETCH_REQUESTED } from '../actions/types'
import helpers from '../helpers'

import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP  } from '../constants'
const database = fbApp.database();

//retrieves user data from firebase if user exists, otherwise creates new user entry in firebase

function* getUserData(userAuthInfo) {
  const properties = _.values(USER_FIELDS_TO_PERSIST)

  const ref = database.ref(`users/${userAuthInfo.uid}`)

  let userData
  yield ref.once('value', (snapshot) => {
    if (snapshot.val()) {
      userData = snapshot.val() || []

    } else {
      ref.set(_.pick(userAuthInfo, ...properties))

      userData = {}//don't need to return anything, because will be combined with the info returned from firebase login anyways
    }
  }, (err) => {
    helpers.handleError(`The user read failed: ${err.code}`)
    userData = false
  })

  return userData
}

function* fetchData(action) {
  try {
    // action.payload is all the data firebase returns from logging in
    const pld = action.payload

//actually, can persist all of this provider data after all, the token is not there
    const userData = yield call(getUserData, pld)
    let tokenStuff = {}
    if (pld.facebookAppSecretProof) {
      tokenStuff.facebookAppSecretProof = pld.facebookAppSecretProof
    }
    /*pld.providerData.forEach((p) => {
      let providerName = PROVIDER_IDS_MAP[p.providerId]
      
      providerData[providerName] = p
    })*/

    const user = Object.assign({}, userData, tokenStuff, {uid: pld.uid})

    yield all([
      put(userFetchSucceeded(user)),
    ])
    yield put(isPreloadingStore(false))

    /* don't have anywhere to redirect to yet!
    if (action.payload.redirect) {
      // helpful way to track where a user has been
      action.user.history.push('')
    }
    */

  } catch (err) {
    console.log('user fetch failed', err)
    yield put(userFetchFailed(err.message))
  }
}

export default function* fetchUserSaga() {
  yield takeLatest(USER_FETCH_REQUESTED, fetchData)
}
