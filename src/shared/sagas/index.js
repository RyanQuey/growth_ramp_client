import { all, call } from 'redux-saga/effects'
import eventHooksSaga from './eventHooksSaga'
import permissionSaga from './permissionSaga'
import planSaga from './planSaga'
import campaignSaga from './campaignSaga'
import linkAccountSaga from './linkAccountSaga'
import providerSaga from './providerSaga'
import querySaga from './querySaga'
import userSaga from './userSaga'
import workgroupSaga from './workgroupSaga'

export default function* rootSaga() {
  yield all([
    call(permissionSaga),
    call(planSaga),
    call(campaignSaga),
    call(userSaga),
    call(linkAccountSaga),
    call(providerSaga),
    call(querySaga),
    call(workgroupSaga),
    call(eventHooksSaga),
  ])
}
