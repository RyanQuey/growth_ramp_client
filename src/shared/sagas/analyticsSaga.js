import { call, put, takeLatest, takeEvery, all, fork, join } from 'redux-saga/effects'
import {
  REACTIVATE_OR_CREATE_WEBSITE_REQUEST,
  REACTIVATE_OR_CREATE_WEBSITE_SUCCESS,
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
  FETCH_ALL_GA_ACCOUNTS_SUCCESS,
  GET_ANALYTICS_REQUEST,
  GET_ANALYTICS_SUCCESS,
  GET_GA_GOALS_REQUEST,
  GET_GA_GOALS_SUCCESS,
  AUDIT_CONTENT_REQUEST,
  AUDIT_CONTENT_SUCCESS,
  FETCH_AUDIT_REQUEST,
  FETCH_AUDIT_SUCCESS,
} from 'constants/actionTypes'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP  } from 'constants'
import { errorActions, alertActions } from 'shared/actions'
import analyticsHelpers from 'helpers/analyticsHelpers'

//disabling environment variables in the front-end; so remove this  ||  when this gets moved to the backend. I will want to throw an error at that point
function* fetchAllGAAccounts(action) {
  try {
    const userId = store.getState().user.id
    const res = yield axios.get(`/api/analytics/getAllAnalyticsAccounts/${userId}`)

    //organize by provider
    const {gaAccounts, gscAccounts} = res.data


    yield all([
      put({
        type: FETCH_ALL_GA_ACCOUNTS_SUCCESS,
        payload: gaAccounts,
        api: "GoogleAnalytics",
      }),
      put({
        type: FETCH_ALL_GA_ACCOUNTS_SUCCESS,
        payload: gscAccounts,
        api: "GoogleSearchConsole",
      })
    ])

    action.cb && action.cb(res.data)

  } catch (err) {
    console.error('all GA accounts fetch failed', err.response || err)
    action.onFailure && action.onFailure(err)
    // yield put(userFetchFailed(err.message))
  }
}

//get analytics for a particular table/chart
function* getAnalytics(action) {
  try {
    const state = store.getState()
    const dataset = action.dataset
    const availableWebsites = state.availableWebsites
//TODO make consistent with site audit, and send filters in action. That way, makes sure sending right stuff, not worreid about race conditions, can customize, etc
    const filtersObj = Object.assign({}, Helpers.safeDataPath(state, `forms.Analytics.filters.params`, {}))
//TODO make consistent with site audit, and call websiteUrl gaSiteUrl
    const {gscStatus, targetApis} = analyticsHelpers.getExternalApiInfo(filtersObj.gscSiteUrl, dataset, availableWebsites)


    if (targetApis.includes("GoogleSearchConsole")) {
      filtersObj.gscUrl = gscUrl
//TODO make consistent with site audit, and call gscUrl gscSiteUrl
      // TODO need to handle
      const haveAccess = gscStatus.status === "ready"
      if (!haveAccess) {
        console.log("not even trying to get analytics data (not security issue, just save time)");
        alertActions.newAlert({
          title: "Failed to get analytics:",
          message: "Insufficient permissions to access Google Search Console for this website",
          level: "DANGER",
          options: {}
        })

        return
      }
    }

    analyticsHelpers.addQueryToFilters(filtersObj, targetApis)

    //transfomr into array of objs, each obj with single key (a filter param).
    //TODO just make these individual queries...just easier
    const filtersStr = JSON.stringify(filtersObj)

    const res = yield axios.get(`/api/analytics/getAnalytics?filters=${filtersStr}&dataset=${dataset}`) //eventually switch to socket


    yield all([
      put({type: GET_ANALYTICS_SUCCESS, payload: {results: res.data, dataset, filters: filtersObj}})
    ])
    action.cb && action.cb(res.data)

  } catch (err) {
    console.error('gwet analytics fetch failed', err.response || err)
    action.onFailure && action.onFailure(err)
    // yield put(userFetchFailed(err.message))
  }
}

//get analytics for a particular table/chart
function* getGAGoals(action) {
  try {
    //transfomr into array of objs, each obj with single key (a filter param).
    const {webPropertyId, googleAccountId} = action.payload

    const res = yield axios.get(`/api/analytics/getGAGoals?gaWebPropertyId=${gaWebPropertyId}&googleAccountId=${googleAccountId}`)

    yield all([
      put({type: GET_GA_GOALS_SUCCESS, payload: {results: res.data, params: action.payload}})
    ])
    action.cb && action.cb(res.data)

  } catch (err) {
    console.error('gwet analytics fetch failed', err.response || err)
    action.onFailure && action.onFailure(err)
    // yield put(userFetchFailed(err.message))
  }
}

function* createAuditWebsite(action) {
  try {
    const userId = store.getState().user.id
    const params = Object.assign({}, action.payload, {userId})

    const res = yield axios.post(`/api/websites/reactivateOrCreate`, params)

    yield all([
      put({
        type: REACTIVATE_OR_CREATE_WEBSITE_SUCCESS,
        payload: res.data,
      }),
    ])

    action.cb && action.cb(res.data)

    alertActions.newAlert({
      title: "Successfully Chose Website!",
      level: "SUCCESS",
    })

  } catch (err) {
    console.error('all GA accounts fetch failed', err.response || err)
    action.onFailure && action.onFailure(err)
    // yield put(websiteCreateFailed(err.message))
  }
}

function* fetchAllSiteAudits(action) {
  try {
    const userId = store.getState().user.id
    const {websiteId} = action.payload

    const res = yield axios.get(`/api/audits?userId=${userId}&websiteId=${websiteId}&status=ACTIVE`)

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

function* auditContent (action) {
  try {
    const state = store.getState()
    const availableWebsites = state.availableWebsites
    const params = action.payload
    const {gscStatus, targetApis} = analyticsHelpers.getExternalApiInfo(params.gscSiteUrl, params.dataset, availableWebsites)
    const haveAccess = gscStatus.status === "ready"

    if (targetApis.includes("GoogleSearchConsole")) {
      const haveAccess = gscStatus.status === "ready"
      if (!haveAccess) {
        console.log("not even trying to get analytics data (not security issue, just save time)");
        alertActions.newAlert({
          title: "Failed to get analytics:",
          message: "Insufficient permissions to access Google Search Console for this website",
          level: "DANGER",
          options: {}
        })

        return
      }
    }

    //transfomr into array of objs, each obj with single key (a filter param).

    const res = yield axios.post(`/api/audits/auditContent`, params) //eventually switch to socket



    yield all([
      put({type: AUDIT_CONTENT_SUCCESS, payload: {results: res.data, dataset, filters: filtersObj}})
    ])
    action.cb && action.cb(res.data)

  } catch (err) {
    console.error('get analytics fetch failed', err.response || err)
      alertActions.newAlert({
        title: "Failed to audit content:",
        message: "Insufficient permissions to access Google Search Console for this website",
        level: "DANGER",
        options: {}
      })

    action.onFailure && action.onFailure(err)
    // yield put(userFetchFailed(err.message))
  }
}

export default function* updateProviderSaga() {
  yield takeLatest(FETCH_ALL_GA_ACCOUNTS_REQUEST, fetchAllGAAccounts)
  yield takeLatest(FETCH_AUDIT_REQUEST, fetchAllSiteAudits)
  yield takeEvery(GET_ANALYTICS_REQUEST, getAnalytics)
  yield takeEvery(GET_GA_GOALS_REQUEST, getGAGoals)
  yield takeEvery(AUDIT_CONTENT_REQUEST, auditContent)
  yield takeLatest(REACTIVATE_OR_CREATE_WEBSITE_REQUEST, createAuditWebsite)

}
