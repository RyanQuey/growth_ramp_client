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
  SET_CURRENT_WEBSITE,
  UPDATE_WEBSITE_REQUEST,
  UPDATE_WEBSITE_SUCCESS,
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
    if (Helpers.safeDataPath(err, "data.message") === "User does not have any Google Analytics account.") {
      err.message = "User does not have any Google Analytics account."
    }
      alertActions.newAlert({
        title: "Failure to fetch Google Analytics accounts: ",
        level: "DANGER",
        message: err.message || "Unknown error",
        options: {timer: false},
      })
    action.onFailure && action.onFailure(err)
    // yield put(userFetchFailed(err.message))
  }
}

//get analytics for a particular table/chart
function* getAnalytics(action) {
  try {
    const state = store.getState()
    const dataset = action.dataset
    const {currentWebsite, availableWebsites} = state

//TODO make consistent with site audit, and send filters in action. That way, makes sure sending right stuff, not worreid about race conditions, can customize, etc
    const paramsObj = Object.assign({}, {
        dataset
      },
      Helpers.safeDataPath(state, `forms.Analytics.filters.params`, {}),
      _.pick(currentWebsite, "googleAccountId", "gscSiteUrl", "gaProfileId", "gaWebPropertyId", "gaSiteUrl"),
    )

    // don't send any params that are null/undefined (those are to be counted as non-params...else will be sent as a string "undefined" ...)
    for (let paramKey of Object.keys(paramsObj)) {
      if ([undefined, null].includes(paramsObj[paramKey])) {
        delete paramsObj[paramKey]
      }
    }

//TODO make consistent with site audit, and call websiteUrl gaSiteUrl
    const {gscStatus, targetApis} = analyticsHelpers.getExternalApiInfo(paramsObj.gscSiteUrl, dataset, availableWebsites)

    if (targetApis.includes("GoogleSearchConsole")) {
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

    // in case current page's url has a query string
    analyticsHelpers.addQueryToFilters(paramsObj, targetApis)

    //transfomr into array of objs, each obj with single key (a filter param).
    const query = Helpers.toQueryString(paramsObj)
    const res = yield axios.get(`/api/analytics/getAnalytics?${query}`) //eventually switch to socket


    yield all([
      put({type: GET_ANALYTICS_SUCCESS, payload: {results: res.data, dataset, filters: paramsObj}})
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
  if (!action.payload.websiteId) {
    console.error("websiteId is required for getting goals");
    return
  }
  try {
    const query = Helpers.toQueryString(action.payload)
    const res = yield axios.get(`/api/analytics/getGAGoals?${query}`)

    yield all([
      put({type: GET_GA_GOALS_SUCCESS, payload: {results: res.data, params: action.payload}})
    ])
    action.cb && action.cb(res.data)

  } catch (err) {
    console.error('get goals failed', err.response || err)
    action.onFailure && action.onFailure(err)
    // yield put(userFetchFailed(err.message))
  }
}

//might use these websites for more than just auditing...but if we do, can changer this func name easily enough
function* createWebsite(action) {
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

  } catch (err) {
    console.error('Create website record failed', err.response || err)
    if (Helpers.safeDataPath(err, "response.data.message") === "too-much-back-and-forth") {
      alertActions.newAlert({
        title: "Irregular Activity Detected:",
        message: <div>It looks like you recently deactivated this website. In order to prevent abuse, this website's audits will remain archived for at least two weeks. Please upgrade your account or contact us at <a href="mailto:hello@growthramp.io">hello@growthramp.io</a> for help</div>,
        level: "DANGER",
        options: {timer: false}
      })
    }
    action.onFailure && action.onFailure(err)
    // yield put(websiteCreateFailed(err.message))
  }
}

function* updateWebsite (action) {
  try {
    const state = store.getState()
    const params = action.payload

    const res = yield axios.put(`/api/websites/${params.id}`, params) //eventually switch to socket

    const yields = [
      put({type: UPDATE_WEBSITE_SUCCESS, payload: res.data})
    ]

    // check if current audit
    const {currentWebsite} = state
    if (currentWebsite && currentWebsite.id === res.data.id) {
      const archived = res.data.status === "ARCHIVED"

      yields.push({type: SET_CURRENT_WEBSITE, payload: archived ? null : res.data})
    }

    yield all(yields)

    action.cb && action.cb(res.data)

  } catch (err) {
    console.error('update website failed', err.response || err)

    action.onFailure && action.onFailure(err)
    // yield put(userFetchFailed(err.message))
  }
}

export default function* saga() {
  yield takeLatest(FETCH_ALL_GA_ACCOUNTS_REQUEST, fetchAllGAAccounts)
  yield takeEvery(GET_ANALYTICS_REQUEST, getAnalytics)
  yield takeEvery(GET_GA_GOALS_REQUEST, getGAGoals)
  yield takeLatest(REACTIVATE_OR_CREATE_WEBSITE_REQUEST, createWebsite)
  yield takeEvery(UPDATE_WEBSITE_REQUEST, updateWebsite)
}
