import 'babel-polyfill'
import { put, select, takeLatest } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { CREATE_POST_SUCCESS, CREATE_POST_REQUEST } from '../actions'
import _ from 'lodash'
const database = fbApp.database();

function* newPost(action) {
  try {
    const pld = action.payload

    let blankPost = {
      title: "",
      content: "",
      userId: pld.userId,
      id: Math.rand(16)
    }
    let postId = database.ref("posts").push(blankPost).key;

    let relationEntry = {}
    relationEntry[postId] = true;
    yield database.ref(`users/${pld.userId}/posts`).set(relationEntry)

    pld.post = {[postId]: blankPost} 
    yield put({ type: CREATE_POST_SUCCESS, payload: {[postId]: blankPost }})

  } catch (err) {
    console.log(`Error in Create post Saga ${err}`)
  }
}

export default function* createNewPost() {
  yield takeLatest(CREATE_POST_REQUEST, newPost)
}

