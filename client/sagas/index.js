import 'babel-polyfill'
import { all, call } from 'redux-saga/effects'
import fetchUserSaga from './fetchUserSaga'
import fetchPlanSaga from './fetchPlanSaga'
import fetchPostSaga from './fetchPostSaga'
import setInputSaga from './setInputSaga'
import signInSaga from './signInSaga'
import signOutSaga from './signOutSaga'
import linkAccountSaga from './linkAccountSaga'
import updateTokenSaga from './updateTokenSaga'
import createPlanSaga from './createPlanSaga'
import createPostSaga from './createPostSaga'
import publishPostSaga from './publishPostSaga'

export default function* rootSaga() {
  yield all([
    call(createPlanSaga),
    call(createPostSaga),
    call(fetchPlanSaga),
    call(fetchPostSaga),
    call(fetchUserSaga),
    call(linkAccountSaga),
    call(publishPostSaga),
    call(setInputSaga),
    call(signInSaga),
    call(signOutSaga),
    call(updateTokenSaga),
  ])
}
