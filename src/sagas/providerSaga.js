import 'babel-polyfill'
import _ from 'lodash'
import { call, put, takeLatest, takeEvery, all, fork, join } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import firebase  from 'firebase'
//import CodeBird from 'codebird' using twit, and in the backend
import { UPDATE_TOKEN_REQUEST, UPDATE_TOKEN_FAILURE, UPDATE_TOKEN_SUCCESS } from 'constants/actionTypes'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP  } from '../constants'
import helpers from '../helpers'
//import FB from 'fb'; do this in the backend
import crypto from 'crypto'

//disabling environment variables in the front-end; so remove this  ||  when this gets moved to the backend. I will want to throw an error at that point
const hmac = crypto.createHmac('sha256', process.env.REACT_APP_FACEBOOK_SECRET_KEY || "abc")

const database = fbApp.database();
const tokenInfo = {}

//called when there is no token in the store (e.g., initial store load), or expired token in the store
function* getTokens(providerId, credential) {
/*console.log(providerId, credential);
  let provider, providerToken
  let providerName = PROVIDER_IDS_MAP[providerId]
  if (credential && credential.providerId === providerId) {
    providerToken = credential.accessToken
  } else {
    let firebaseToken = firebase.auth().currentUser.getToken()
    //it doesn't work currently, I can't get this data provider token in this way...try https://firebase.google.com/docs/auth/web/account-linking
    //or, skip firebase: https://developers.facebook.com/docs/facebook-login/access-tokens/expiration-and-extension/
    //providerToken = firebase.auth().FacebookAuthProvider.credential(firebaseToken)
  }
console.log(providerToken, providerName);
  if (providerToken) {
    switch (providerName) {
      case 'facebook':
        FB.setAccessToken(providerToken)

        //create a hash of the token (which Facebook requires)
        hmac.update(providerToken)
        //TODO: require this in the Facebook app, then pass it in with each request
        tokenInfo.facebookAppSecretProof = hmac.digest('hex');//use hex?

        break
      case 'twitter':
        codeBird.setToken(credential.accessToken, credential.secret)
        tokenInfo.twitter = {}
      //can't do this, read us can store something like a codeBird
        tokenInfo.twitter.api = codeBird
        break

      case 'google':
        break

      default:
        //not really sure which token this returns...
        provider = firebase.auth().getIdToken(true)
    }
    //might not want to put this into store...probably just use Boolean instead
    tokenInfo[providerName] = tokenInfo[providerName] || {}
    tokenInfo[providerName].authenticated = true

  }

  // TODO: don't save this in the store, save it somewhere where it can be reused even if there is a screen refresh...without all of the database calls if possible (am I making database calls?)
  return tokenInfo
*/
}

function* updateData(action) {
  try {
    // action.payload is an object: {providerIds: ['facebook.com',], credential: {token: '...'}}
    // only gets a credential if this action was called from the signInSaga
    const pld = action.payload

    // can persist all except credential (pld.credential)
    if (pld.providerIds) {
      let tasks = []
      for (let providerId of pld.providerIds) {
        let task = yield fork(getTokens, providerId, pld.credential)
        tasks.push(task)
      }
      // wait for all of the tasks to finish
      yield join(...tasks)
    }


    const tokens = Object.assign({}, tokenInfo)

    yield put({type: UPDATE_TOKEN_SUCCESS, payload: tokens})
  } catch (err) {
    console.log('token update failed', err)
    yield put({type: UPDATE_TOKEN_FAILURE, payload: err.message})
  }
}

export default function* updateTokenSaga() {
  yield takeLatest(UPDATE_TOKEN_REQUEST, updateData)
}
