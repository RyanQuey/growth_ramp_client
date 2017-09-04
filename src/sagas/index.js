import 'babel-polyfill'
import { all, call } from 'redux-saga/effects'
import fetchUserSaga from './fetchUserSaga'
import fetchPostsSaga from './fetchPostsSaga'
import setInputSaga from './setInputSaga'
import signInSaga from './signInSaga'
import signOutSaga from './signOutSaga'
//import writePostsSaga from './signOutSaga'

export default function* rootSaga() {
  yield all([
    call(fetchUserSaga),
    call(fetchPostsSaga),
    call(setInputSaga),
    call(signInSaga),
    call(signOutSaga),
    //call(writePostsSaga),
  ])
}
