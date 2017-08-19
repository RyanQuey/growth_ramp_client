import 'babel-polyfill'
import _ from 'lodash'
import { call, put, takeLatest } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { isPreloadingStore, userFetchFailed, userFetchSucceeded } from '../actions'
import { USER_FETCH_REQUESTED } from '../actions/types'
/*going to do without all of these constants
import { FIELDS } from 'utils/constants'
*/

function* getVals(userAuthInfo) {
  const properties = _.values('FIELDS')

  const ref = fbApp.database().ref(`users/${userAuthInfo.uid}`)

  const userData = yield ref.once('value').then((snapshot) => {
    // If snapshot.val() is not undefined, user has signed in before
    if (snapshot.val()) {
      const vals = {}

      properties.forEach((property) => {
        if (snapshot.val()[property]) {
          vals[property] = snapshot.val()[property]
        }
      })

      return vals
    }

    ref.set(_.omit(userAuthInfo, 'uid'))
    return {}
  })

  return userData
}

function* fetchUserData(action) {
  try {
    const userAuthInfo = {
      displayName: action.payload.displayName,
      email: action.payload.email,
      photoURL: action.payload.photoURL,
      uid: action.payload.uid,
    }
    const userData = yield call(getVals, userAuthInfo)
    const user = Object.assign({}, userAuthInfo, userData)

    yield put(userFetchSucceeded(user))
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
  yield takeLatest(USER_FETCH_REQUESTED, fetchUserData)
}
