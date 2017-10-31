import { put, select, take, takeLatest, call, all } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { PUBLISH_POST_REQUEST,
  SIGN_IN_POPUP_CLOSED,
  PUBLISH_POST_SUCCESS,
  SIGN_IN_REQUEST,
  CREATE_POST_SUCCESS,
  CREATE_POST_REQUEST,
  DESTROY_POST_REQUEST,
  DESTROY_POST_SUCCESS,
  FETCH_POST_REQUEST,
  FETCH_POST_SUCCESS,
  SET_POST,
  USER_POSTS_OUTDATED,
} from 'constants/actionTypes'

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
    const pld = action.payload

    let blankPost = {
      title: "",
      content: "",
      status: "DRAFT",
      userId: pld.userId,
      planId: pld.planId,
    }

    const res = yield axios.post("/api/posts", blankPost) //eventually switch to socket
    const newRecord = res.data
    const postId = newRecord.id

    yield put({ type: CREATE_POST_SUCCESS, payload: {[postId]: newRecord}})

  } catch (err) {
    console.log(`Error in Create post Saga ${err}`)
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

function* destroyPost(action) {
  try {
    const pld = action.payload

    //TODO: eventually they filter out posts that have already been sent
    const res = yield axios.delete(`/api/posts/${pld.id}`) //eventually switch to socket
console.log(res);
    yield all([
      put({type: DESTROY_POST_SUCCESS, payload: res}),
      put({type: USER_POSTS_OUTDATED}),
    ])

  } catch (err) {
    console.log('posts destroy failed', err)
  }
}


//actually don't need this for now...but might later, so whatever
function* populatePost(action) {
  try {
    const post = action.payload
    const userId = pld.userId

    //TODO: eventually they filter out posts that have already been sent
    const res = yield axios.get(`/api/posts/${post.id}?populate=planId`) //eventually switch to socket

    //converting into object
    const posts = res.data.reduce((acc, post) => {
      acc[post.id] = post
      return acc
    }, {})
    yield all([
      //put({type: FETCH_POST_SUCCESS, payload: posts})
    ])

  } catch (err) {
    console.log('posts fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}


export default function* postSaga() {
  yield takeLatest(FETCH_POST_REQUEST, fetchPosts)
  yield takeLatest(PUBLISH_POST_REQUEST, publishPost)
  yield takeLatest(CREATE_POST_REQUEST, createPost)
  yield takeLatest(DESTROY_POST_REQUEST, destroyPost)
  //when setting as the current post, will want to populate several of the associations
  //yield takeLatest(SET_POST, populatePost)
}


