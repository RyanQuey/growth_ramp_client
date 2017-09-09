import 'babel-polyfill'
import _ from 'lodash'
import { call, put, takeLatest, all } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { postsFetchSuccess } from '../actions'
import { POSTS_FETCH_REQUEST } from '../actions/types'
import helpers from '../helpers'

const database = fbApp.database();

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
function* getPosts(userId){
  //Only want to retrieve this user's posts once...for now
  //TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
  let posts
  //TODO: eventually they filter out posts that have already been sent
  yield database.ref(`posts`).orderByChild('userId').equalTo(userId).once("value", (snapshot) => {
    posts = snapshot.val() || []
  }, (err) => {
    helpers.handleError(`The posts read failed: ${err.code}`)
    posts = []
  })

  return posts
}

function* fetchData(action) {
  try {
    const pld = action.payload
    const userId = pld.uid

    const postsData = yield call(getPosts, userId)
    const posts = Object.assign({}, postsData)

    yield all([
      put(postsFetchSuccess(posts)),
    ])

  } catch (err) {
    console.log('posts fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}

export default function* fetchPostsSaga() {
  yield takeLatest(POSTS_FETCH_REQUEST, fetchData)
}
