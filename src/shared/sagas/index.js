import { all, call } from 'redux-saga/effects'
import userSaga from './userSaga'
import planSaga from './planSaga'
import postSaga from './postSaga'
import linkAccountSaga from './linkAccountSaga'
import providerSaga from './providerSaga'
import querySaga from './querySaga'
import eventHooksSaga from './eventHooksSaga'

export default function* rootSaga() {
  yield all([
    call(planSaga),
    call(postSaga),
    call(userSaga),
    call(linkAccountSaga),
    call(providerSaga),
    call(querySaga),
    call(eventHooksSaga),
  ])
}
