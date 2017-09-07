import 'babel-polyfill'
import { put, select, takeLatest } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { POST_CREATE_SUCCEEDED, POST_CREATE_REQUESTED } from '../actions/types'
import _ from 'lodash'
const database = fbApp.database();

function* newPost(action) {
  try {
    const pld = action.payload

    let blankPost = {
      title: "",
      content: "",
      userId: pld.userId,
    }
    let postId = database.ref("posts").push(blankPost).key;

    let relationEntry = {}
    relationEntry[postId] = true;
    yield database.ref(`users/${pld.userId}/posts`).set(relationEntry)

    pld.post = {[postId]: blankPost} 
    yield put({ type: POST_CREATE_SUCCEEDED, payload: {[postId]: blankPost }})

  } catch (err) {
    console.log(`Error in Create post Saga ${err}`)
  }
}

export default function* createNewPost() {
  yield takeLatest(POST_CREATE_REQUESTED, newPost)
}

