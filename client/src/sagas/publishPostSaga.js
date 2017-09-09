import 'babel-polyfill'
import { put, select, take, takeLatest, call } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import fbApp from '../firebaseApp.js'
import { POST_PUBLISH_REQUEST, SIGN_IN_POPUP_CLOSED } from '../actions/types'
import { postPublishSuccess, signInRequest } from '../actions'
import FB from 'fb';
import helpers from '../helpers'
import _ from 'lodash'
const database = fbApp.database();


function* sendToProvider(providerName, pld, tokenInfo) {
  const publishFunctions = {
    facebook: () => {
      FB.api(`/me/feed`, 'post', pld.post.message, (response) => {
        if (!response || response.error) {
          let newError = helpers.handleError(response.error);
            
        } else {
          alert('Facebook post ID: ' + response.id);
        }
      })
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
    let a = yield put(signInRequest(data))
    tokenInfo = yield select(state => helpers.safeDataPath(state, `tokens.${providerName}.accessToken`, false))
    yield take(SIGN_IN_POPUP_CLOSED)
    logins++
  }
  console.log("going for two fast", providerName);
  return {tokenInfo, logins}
}

function* publish(action) {
  let logins = 0
  try {
    const pld = action.payload
    for (let i = 0;i < pld.providers.length; i++) {
      const providerName = pld.providers[i]
      console.log("now starting ", providerName);
      //since I'm passing the token, another reason why this should be done in the backend
      
      let result = yield call(checkForToken, providerName, i, logins)
      let tokenInfo = result.tokenInfo
console.log(tokenInfo);
      logins = result.logins
      //make sync; can only have one pop up at a time
      //yield all, or promise all
      yield call(sendToProvider, providerName, pld, tokenInfo)
    }
    //mark post as published
    yield database.ref(`posts/${pld.post.id}/published`).set(true)
    yield put(postPublishSuccess({providers: pld.providers}))

  } catch (err) {
    console.log(`Error in Create post Saga ${err}`)
  }
}

export default function* publishPost() {
  yield takeLatest(POST_PUBLISH_REQUEST, publish)
}

