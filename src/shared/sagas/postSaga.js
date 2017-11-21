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
  const campaignPosts = Helpers.safeDataPath(store.getState(), `currentCampaign.posts`, [])
  //convert to object for easy getting/setting
  const postObj = campaignPosts.reduce((acc, post) => {
    acc[post.id] = post
    return acc
  }, {})
  formActions.setParams("Compose", "posts", postObj, false)
}

function* sendToProvider(providerName, pld, tokenInfo) {
  const publishFunctions = {
    facebook: () => {
      /*FB.api(`/me/feed`, 'post', pld.post.message, (response) => {
        if (!response || response.error) {
          let newError = helpers.handleError(response.error);

        } else {
          alert('Facebook post ID: ' + response.id);
        }
      })*/
    },
    twitter: () => {
      tokenInfo.api.__call("statuses_update", {
        status: pld.post.content
      }, function(reply){
        console.log("Twitter Post Succeeded: ",reply)
      });
    },
    linkedin: () => {

    },
  }

console.log(providerName);
  publishFunctions[providerName]()
}

function* checkForToken(providerName, index, logins) {
  let tokenInfo = yield select(state => helpers.safeDataPath(state, `tokenInfo.${providerName}`, false))
  if (!tokenInfo.authenticated) {
    if (logins > 0) {
      //needs a button click; Twitter and perhaps Facebook, don't allow one to go after the other like this
      throw "Please login again with " + providerName
    }
    const data = {
      signInType: 'PROVIDER',
      provider: providerName.toUpperCase(),
      wantTokenOnly: true,
    }
    let a = yield put({type: SIGN_IN_REQUEST, payload: data})
    tokenInfo = yield select(state => helpers.safeDataPath(state, `tokens.${providerName}.accessToken`, false))
    yield take(SIGN_IN_POPUP_CLOSED)
    logins++
  }
  console.log("going for two fast", providerName);
  return {tokenInfo, logins}
}

function* publishPost(action) {
  let logins = 0
  try {
    const pld = action.payload
    for (let i = 0;i < pld.providers.length; i++) {
      const providerName = pld.providers[i]
      console.log("now starting ", providerName);
      //since I'm passing the token, another reason why this should be done in the backend

      let result = yield call(checkForToken, providerName, i, logins)
      let tokenInfo = result.tokenInfo
      logins = result.logins
      //make sync; can only have one pop up at a time
      //yield all, or promise all
      yield call(sendToProvider, providerName, pld, tokenInfo)
    }
    //mark post as published
    yield database.ref(`posts/${pld.post.id}/published`).set(true)
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


