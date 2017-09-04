import 'babel-polyfill'
import { put, select, takeLatest } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { CREATE_DRAFT_SUCCEEDED, CREATE_DRAFT_REQUESTED } from '../actions/types'
import _ from 'lodash'
const database = fbApp.database();

function* newDraft(action) {
console.log("should be dothrottlene now");
  try {
    const pld = action.payload

    let blankDraft = {
      title: "",
      content: "",
      userId: pld.userId,
    }
    let draftId = database.ref("drafts").push(blankDraft).key;

    let relationEntry = {}
    relationEntry[draftId] = true;
    yield database.ref(`users/${pld.userId}/drafts`).set(relationEntry)

    pld.draft = {[draftId]: blankDraft} 
    yield put({ type: CREATE_DRAFT_SUCCEEDED, payload: pld })

  } catch (err) {
    console.log(`Error in Create draft Saga ${err}`)
  }
}

export default function* newDraft() {
  yield takeLatest(CREATE_DRAFT_REQUESTED, newDraft)
}

