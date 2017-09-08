import 'babel-polyfill'
import _ from 'lodash'
import { call, put, takeLatest, takeEvery, all, fork, join } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import firebase  from 'firebase'
import CodeBird from 'codebird'
import { tokensUpdateFailure, tokensUpdateSuccess } from '../actions'
import { TOKENS_UPDATE_REQUEST } from '../actions/types'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP  } from '../constants'
import helpers from '../helpers'
import FB from 'fb';
import crypto from 'crypto'

const codeBird = new CodeBird
codeBird.setConsumerKey(process.env.REACT_APP_TWITTER_CONSUMER_KEY, process.env.REACT_APP_TWITTER_CONSUMER_SECRET)

const hmac = crypto.createHmac('sha256', process.env.REACT_APP_FACEBOOK_SECRET_KEY)

const database = fbApp.database();
const tokenInfo = {}

//called when there is no token in the store (e.g., initial store load), or expired token in the store
function* getTokens(providerId, credential) {
console.log(providerId, credential);
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
        
        codeBird.setToken(process.env.REACT_APP_TWITTER_ACCESS_TOKEN, process.env.REACT_APP_TWITTER_TOKEN_SECRET)
        tokenInfo.twitter = {}
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

    yield put(tokensUpdateSuccess(tokens))
  } catch (err) {
    console.log('token update failed', err)
    yield put(tokensUpdateFailure(err.message))
  }
}

export default function* updateTokenSaga() {
  yield takeLatest(TOKENS_UPDATE_REQUEST, updateData)
}
