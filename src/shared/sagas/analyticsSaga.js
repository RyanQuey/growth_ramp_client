import { call, put, takeLatest, takeEvery, all, fork, join } from 'redux-saga/effects'
import {
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
  FETCH_ALL_GA_ACCOUNTS_SUCCESS,
  GET_ANALYTICS_REQUEST,
  GET_ANALYTICS_SUCCESS,
  GET_GA_GOALS_REQUEST,
  GET_GA_GOALS_SUCCESS,
  AUDIT_CONTENT_REQUEST,
  AUDIT_CONTENT_SUCCESS,
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
    const websites = state.websites
    const filtersObj = Object.assign({}, Helpers.safeDataPath(state, `forms.Analytics.filters.params`, {}))
    const {gscStatus, gscUrl, targetApis} = analyticsHelpers.getExternalApiInfo(filtersObj.websiteUrl, dataset, websites)


    if (targetApis.includes("GoogleSearchConsole")) {
      filtersObj.gscUrl = gscUrl
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
    const {websiteId, providerAccountId} = action.payload

    const res = yield axios.get(`/api/analytics/getGAGoals?websiteId=${websiteId}&providerAccountId=${providerAccountId}`) //eventually switch to socket

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
function* auditContent (action) {
  try {
    const state = store.getState()
    const dataset = action.dataset || "auditContent-testGroup-nonGoals"
    const websites = state.websites
    const filtersObj = Object.assign({}, Helpers.safeDataPath(state, `forms.AuditContent.filters.params`, {}))
    const {gscStatus, gscUrl, targetApis} = analyticsHelpers.getExternalApiInfo(filtersObj.websiteUrl, dataset, websites)
    const haveAccess = gscStatus.status === "ready"

    if (targetApis.includes("GoogleSearchConsole")) {
      filtersObj.gscUrl = gscUrl
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
    const filtersStr = JSON.stringify(filtersObj)

    const res = yield axios.get(`/api/analytics/auditContent?filters=${filtersStr}&dataset=${dataset}`) //eventually switch to socket



    yield all([
      put({type: AUDIT_CONTENT_SUCCESS, payload: {results: res.data, dataset, filters: filtersObj}})
    ])
    action.cb && action.cb(res.data)

  } catch (err) {
    console.error('gwet analytics fetch failed', err.response || err)
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
  yield takeEvery(GET_ANALYTICS_REQUEST, getAnalytics)
  yield takeEvery(GET_GA_GOALS_REQUEST, getGAGoals)
  yield takeEvery(AUDIT_CONTENT_REQUEST, auditContent)

}
