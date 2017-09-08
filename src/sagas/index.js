import 'babel-polyfill'
import { all, call } from 'redux-saga/effects'
import fetchUserSaga from './fetchUserSaga'
import fetchPostsSaga from './fetchPostsSaga'
import setInputSaga from './setInputSaga'
import signInSaga from './signInSaga'
import signOutSaga from './signOutSaga'
import linkAccountSaga from './linkAccountSaga'
import updateTokensSaga from './updateTokensSaga'
import createPostSaga from './createPostSaga'
import publishPostSaga from './publishPostSaga'

export default function* rootSaga() {
  yield all([
    call(fetchUserSaga),
    call(linkAccountSaga),
    call(fetchPostsSaga),
    call(signInSaga),
    call(createPostSaga),
    call(publishPostSaga),
    call(setInputSaga),
    call(signOutSaga),
    call(updateTokensSaga),
  ])
}
