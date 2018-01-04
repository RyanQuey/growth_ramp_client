import { all, call } from 'redux-saga/effects'
import campaignSaga from './campaignSaga'
import accountSubscriptionSaga from './accountSubscriptionSaga'
import eventHooksSaga from './eventHooksSaga'
//TODO not using this; remove
import linkAccountSaga from './linkAccountSaga'
import permissionSaga from './permissionSaga'
import planSaga from './planSaga'
import postSaga from './postSaga'
import postTemplateSaga from './postTemplateSaga'
import providerSaga from './providerSaga'
import querySaga from './querySaga'
import userSaga from './userSaga'
import workgroupSaga from './workgroupSaga'

export default function* rootSaga() {
  yield all([
    call(accountSubscriptionSaga),
    call(campaignSaga),
    call(eventHooksSaga),
    call(linkAccountSaga),
    call(querySaga),
    call(permissionSaga),
    call(planSaga),
    call(postSaga),
    call(postTemplateSaga),
    call(providerSaga),
    call(userSaga),
    call(workgroupSaga),
  ])
}
