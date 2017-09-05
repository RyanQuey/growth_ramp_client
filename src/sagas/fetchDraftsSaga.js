import 'babel-polyfill'
import _ from 'lodash'
import { call, put, takeLatest, all } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { draftsFetchSucceeded } from '../actions'
import { DRAFTS_FETCH_REQUESTED } from '../actions/types'
import helpers from '../helpers'

const database = fbApp.database();

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
function* getDrafts(userId){
  //Only want to retrieve this user's drafts once...for now
  //TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
  let drafts
  yield database.ref(`drafts`).orderByChild('userId').equalTo(userId).once("value", (snapshot) => {
    drafts = snapshot.val() || []
  }, (err) => {
    helpers.handleError(`The drafts read failed: ${err.code}`)
    drafts = []
  })

  return drafts
}

function* fetchData(action) {
  try {
    const pld = action.payload
    const userId = pld.uid

    const draftsData = yield call(getDrafts, userId)
    const drafts = Object.assign({}, draftsData)

    yield all([
      put(draftsFetchSucceeded(drafts)),
    ])

  } catch (err) {
    console.log('drafts fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}

export default function* fetchDraftsSaga() {
  yield takeLatest(DRAFTS_FETCH_REQUESTED, fetchData)
}
