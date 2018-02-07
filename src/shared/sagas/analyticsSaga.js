import { call, put, takeLatest, takeEvery, all, fork, join } from 'redux-saga/effects'
import {
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
  FETCH_ALL_GA_ACCOUNTS_SUCCESS,
  GET_ANALYTICS_REQUEST,
  GET_ANALYTICS_SUCCESS,
} from 'constants/actionTypes'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP  } from 'constants'
import { errorActions, alertActions } from 'shared/actions'

//disabling environment variables in the front-end; so remove this  ||  when this gets moved to the backend. I will want to throw an error at that point
function* fetchAllGAAccounts(action) {
  try {
    const userId = store.getState().user.id
    const res = yield axios.get(`/api/analytics/getAllGAAccounts/${userId}`)

    //organize by provider
    const allAccounts = res.data
    yield all([
      put({type: FETCH_ALL_GA_ACCOUNTS_SUCCESS, payload: allAccounts})
    ])

    action.cb && action.cb(allAccounts)

  } catch (err) {
    console.log('all GA accounts fetch failed', err.response || err)
    // yield put(userFetchFailed(err.message))
  }
}

//get analytics for a particular table/chart
function* getAnalytics(action) {
  try {
    const state = store.getState()
    const dataset = action.dataset

    const filtersObj = Helpers.safeDataPath(state, `forms.Analytics.filters.params`, {})
    //transfomr into array of objs, each obj with single key (a filter param).
    const filters = JSON.stringify(filtersObj)
    const res = yield axios.get(`/api/analytics/getAnalytics?filters=${filters}`) //eventually switch to socket


    yield all([
      put({type: GET_ANALYTICS_SUCCESS, payload: {data: res.data, dataset}})
    ])
    action.cb && action.cb(res.data)

  } catch (err) {
    console.log('current account fetch failed', err.response || err)
    // yield put(userFetchFailed(err.message))
  }
}

export default function* updateProviderSaga() {
  yield takeLatest(FETCH_ALL_GA_ACCOUNTS_REQUEST, fetchAllGAAccounts)
  yield takeLatest(GET_ANALYTICS_REQUEST, getAnalytics)

}
