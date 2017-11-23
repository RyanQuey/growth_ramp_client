import { put, select, take, takeLatest, call, all } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import {
  SIGN_IN_REQUEST,
  CREATE_POST_SUCCESS,
  CREATE_POST_REQUEST,
  DESTROY_POST_REQUEST,
  DESTROY_POST_SUCCESS,
  FETCH_POST_REQUEST,
  FETCH_POST_SUCCESS,
  PUBLISH_POST_REQUEST,
  PUBLISH_POST_SUCCESS,
  SET_CURRENT_POST,
  UPDATE_POST_REQUEST,
  UPDATE_POST_SUCCESS,
} from 'constants/actionTypes'
import {errorActions, formActions} from 'shared/actions'

//basically, the post you are working on will reflect the same data it had, and params are ready to persisted if you update again
const _matchStateToRecord = () => {
console.log("now running");
  const campaignPosts = Helpers.safeDataPath(store.getState(), `currentCampaign.posts`, [])
  //convert to object for easy getting/setting
  const postObj = campaignPosts.reduce((acc, post) => {
    acc[post.id] = post
    return acc
  }, {})
  formActions.setParams("Compose", "posts", postObj, false)
}

//if want to send one post apart from campaign
//don't allow this if campaign isn't published yet
function* publishPost(action) {
  try {
    const pld = action.payload

    yield axios.post(`posts/${pld.campaign.id}/publish`, pld)
    yield put({type: PUBLISH_POST_SUCCESS, payload: {providers: pld.providers}})

  } catch (err) {
    console.log(`Error in Create post Saga ${err}`)
  }
}

function* createPost(action) {
  try {
    const post = action.payload

    const res = yield axios.post("/api/posts", post) //eventually switch to socket
    const newRecord = res.data
    const postId = newRecord.id

    if (action.cb) {
      action.cb(newRecord)
    }
    yield all([
      put({ type: CREATE_POST_SUCCESS, payload: {[postId]: newRecord}}),
      //TODO especially when there are more posts, will want to just merge this one post to the posts list, rather than fetching all..
    ])

  } catch (err) {
    console.log(`Error in Create post Saga ${err}`)
    errorActions.handleErrors({
      templateName: "Post",
      templatePart: "create",
      title: "Error creating post",
      errorObject: err,
    })
  }
}

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
//Only want to retrieve this user's posts once...for now
//TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
function* fetchPosts(action) {
  try {
    const pld = action.payload || {}
    const userId = pld.userId || store.getState().user.id//making it so no reason to actually attach a payload...

    //TODO: eventually they filter out posts that have already been sent
    //also want to just retrieve a specific post sometimes...ie, be able to pass in criteria
    const res = yield axios.get(`/api/users/${userId}/posts`) //eventually switch to socket

    //converting into object
    const posts = res.data.reduce((acc, post) => {
      acc[post.id] = post
      return acc
    }, {})
    yield all([
      put({type: FETCH_POST_SUCCESS, payload: posts})
    ])

  } catch (err) {
    console.log('posts fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}

//NOTE: make sure to always attach the userId to the payload, for all updates. Saves a roundtrip for the api  :)
function* updatePost(action) {
  try {
    const postData = action.payload

    const res = yield axios.put(`/api/posts/${postData.id}`, postData) //eventually switch to socket

    yield all([
      put({ type: UPDATE_POST_SUCCESS, payload: res.data}),
    ])

    _matchStateToRecord()

  } catch (err) {
    console.log(err.response);
    console.log(`Error in update post Saga ${err}`)
  }
}

function* destroyPost(action) {
  try {
    const pld = action.payload

    //TODO: eventually they filter out posts that have already been sent
    const res = yield axios.delete(`/api/posts/${pld.id}`) //eventually switch to socket
    yield all([
      put({type: DESTROY_POST_SUCCESS, payload: res}),
    ])

  } catch (err) {
    console.log('posts destroy failed', err)
  }
}

//Gets all the populated data required for working on a single post
function* fetchCurrentPost(action) {
  try {
    const postId = action.payload

    const res = yield axios.get(`/api/posts/${postId}?populate=posts`) //eventually switch to socket

    yield all([
      put({type: SET_CURRENT_POST, payload: res.data})
    ])

  } catch (err) {
    console.log('posts fetch failed', err.response)
    // yield put(userFetchFailed(err.message))
  }
}


export default function* postSaga() {
  yield takeLatest(FETCH_POST_REQUEST, fetchPosts)
  yield takeLatest(CREATE_POST_REQUEST, createPost)
  yield takeLatest(UPDATE_POST_REQUEST, updatePost)
  yield takeLatest(DESTROY_POST_REQUEST, destroyPost)
  yield takeLatest(PUBLISH_POST_REQUEST, publishPost)
  //when setting as the current post, will want to populate several of the associations
  //yield takeLatest(SET_POST, populatePost)
}


