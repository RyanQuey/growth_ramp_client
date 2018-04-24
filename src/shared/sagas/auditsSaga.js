import { call, put, takeLatest, takeEvery, all, fork, join } from 'redux-saga/effects'
import {
  FETCH_AUDIT_LIST_REQUEST,
  FETCH_AUDIT_LIST_SUCCESS,
  AUDIT_CONTENT_REQUEST,
  AUDIT_CONTENT_SUCCESS,
  FETCH_AUDIT_REQUEST,
  FETCH_AUDIT_SUCCESS,
  UPDATE_AUDIT_LIST_ITEM_REQUEST,
  UPDATE_AUDIT_LIST_ITEM_SUCCESS,
} from 'constants/actionTypes'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP  } from 'constants'
import { errorActions, alertActions } from 'shared/actions'
import analyticsHelpers from 'helpers/analyticsHelpers'

function* fetchAllSiteAudits(action) {
  try {
    const userId = store.getState().user.id
    const pld = action.payload
    const params = Object.assign({}, pld, {
      status: "ACTIVE",
      userId,
    })
    const query = Helpers.toQueryString(params)
    const res = yield axios.get(`/api/audits?${query}`)

    //organize by provider

    yield all([
      put({
        type: FETCH_AUDIT_SUCCESS,
        payload: res.data,
      }),
    ])

    action.cb && action.cb(res.data)

  } catch (err) {
    console.error('fetch audits failed', err.response || err)
    action.onFailure && action.onFailure(err)
    // yield put(userFetchFailed(err.message))
  }
}

function* fetchAuditList(action) {
  try {
    const pld = action.payload
    const {options = {}} = action
    const params = Object.assign({}, pld)

    if (options.withListsForPreviousAudit) {
      //get previous audit lists for point of comparison
      let previousAudit = store.getState().previousAudit

      params.auditId = [params.auditId, previousAudit.id]
    }

    const query = Helpers.toQueryString(params)

    const res = yield axios.get(`/api/auditLists/getPopulatedLists?${query}`)

    //organize by provider

    yield all([
      put({
        type: FETCH_AUDIT_LIST_SUCCESS,
        payload: res.data,
      }),
    ])

    action.cb && action.cb(res.data)

  } catch (err) {
    console.error('fetch audits failed', err.response || err)
    action.onFailure && action.onFailure(err)
    // yield put(userFetchFailed(err.message))
  }
}

function* auditContent (action) {
  try {
    const state = store.getState()
    const params = action.payload
    const site = state.websites[params.websiteId]
    const haveAccess = ["siteOwner", "siteRestrictedUser", "siteFullUser"].includes(site.gscPermissionLevel)

    if (!haveAccess) {
      console.log("not even trying to get analytics data (not security issue, just save time)");
      alertActions.newAlert({
        title: "Failed to perform audit:",
        message: "Please setup Google Search Console for this website before auditing",
        level: "DANGER",
        options: {timer: false}
      })

      return
    }

    //transfomr into array of objs, each obj with single key (a filter param).

    const res = yield axios.post(`/api/audits/auditContent`, params) //eventually switch to socket

    if (res.data.err) {
      throw res.data.err
    }

    yield all([
      put({type: AUDIT_CONTENT_SUCCESS, payload: res.data.audit}),
      call(fetchAllSiteAudits, {payload: {websiteId: params.websiteId,}})
    ])
    action.cb && action.cb(res.data)

  } catch (err) {
    console.log("here?")
    console.error('audit failed', err.response || err)
    alertActions.newAlert({
      title: "Failed to Audit Content:",
      message: Helpers.safeDataPath(err, "response.data.message") || "Unknown Error",
      level: "DANGER",
      options: {}
    })

    action.onFailure && action.onFailure(err)
    // yield put(userFetchFailed(err.message))
  }
}

function* updateAuditListItem (action) {
  try {
    const state = store.getState()
    const params = action.payload

    const res = yield axios.put(`/api/auditListItems/${params.id}`, params) //eventually switch to socket

    yield all([
      put({type: UPDATE_AUDIT_LIST_ITEM_SUCCESS, payload: res.data})
    ])
    action.cb && action.cb(res.data)

  } catch (err) {
    console.error('update audit list item failed', err.response || err)
      alertActions.newAlert({
        title: "Failed to Update Audit Item",
        level: "DANGER",
        options: {}
      })

    action.onFailure && action.onFailure(err)
    // yield put(userFetchFailed(err.message))
  }
}

export default function* updateProviderSaga() {
  yield takeLatest(FETCH_AUDIT_REQUEST, fetchAllSiteAudits)
  yield takeEvery(FETCH_AUDIT_LIST_REQUEST, fetchAuditList)
  yield takeEvery(AUDIT_CONTENT_REQUEST, auditContent)
  yield takeEvery(UPDATE_AUDIT_LIST_ITEM_REQUEST, updateAuditListItem)
}
