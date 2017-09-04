import 'babel-polyfill'
import { all, call } from 'redux-saga/effects'
import fetchUserSaga from './fetchUserSaga'
import fetchDraftsSaga from './fetchDraftsSaga'
import setInputSaga from './setInputSaga'
import signInSaga from './signInSaga'
import signOutSaga from './signOutSaga'
import updateTokensSaga from './updateTokensSaga'
import createDraftSaga from './createDraftSaga'

export default function* rootSaga() {
  yield all([
    call(fetchUserSaga),
    call(fetchDraftsSaga),
    call(signInSaga),
    call(createDraftSaga),
    call(setInputSaga),
    call(signOutSaga),
    call(updateTokensSaga),
  ])
}
