import 'babel-polyfill'
import _ from 'lodash'
import { call, put, takeLatest, all } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { postsFetchSucceeded } from '../actions'
import { USER_FETCH_REQUESTED, POSTS_FETCH_REQUESTED } from '../actions/types'
import helpers from '../helpers'

const database = fbApp.database();

// need to make sure that the current user and the userId are identical for security reasons
function* getPosts(userId){
  //Only want to retrieve this user's posts once...for now
  //TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
  let posts
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
      put(postsFetchSucceeded(posts)),
    ])

  } catch (err) {
    console.log('user fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}

export default function* fetchPostsSaga() {
  yield all([
    takeLatest(POSTS_FETCH_REQUESTED, fetchData),
    takeLatest(USER_FETCH_REQUESTED, fetchData)
  ])
}
