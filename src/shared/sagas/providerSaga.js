import { call, put, takeLatest, takeEvery, all, fork, join } from 'redux-saga/effects'
//import CodeBird from 'codebird' using twit, and in the backend
import { UPDATE_PROVIDER_REQUEST, UPDATE_PROVIDER_FAILURE, UPDATE_PROVIDER_SUCCESS } from 'constants/actionTypes'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP  } from 'constants'
//import FB from 'fb'; do this in the backend
import crypto from 'crypto'

//disabling environment variables in the front-end; so remove this  ||  when this gets moved to the backend. I will want to throw an error at that point
const hmac = crypto.createHmac('sha256', process.env.REACT_APP_FACEBOOK_SECRET_KEY || "abc")

const providerInfo = {}

//called when there is no provider in the store (e.g., initial store load), or expired provider in the store
function* getProviders(providerId, credential) {
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
    // action.payload is an object: {providerIds: ['facebook.com',], credential: {provider: '...'}}
    // only gets a credential if this action was called from the signInSaga
    const pld = action.payload

    // can persist all except credential (pld.credential)
    if (pld.providerIds) {
      let tasks = []
      for (let providerId of pld.providerIds) {
        //let task = yield fork(getproviders, providerId, pld.credential)
        tasks.push(task)
      }
      // wait for all of the tasks to finish
      yield join(...tasks)
    }


    const providers = Object.assign({}, providerInfo)

    yield put({type: UPDATE_PROVIDER_SUCCESS, payload: providers})
  } catch (err) {
    console.log('provider update failed', err)
    yield put({type: UPDATE_PROVIDER_FAILURE, payload: err.message})
  }
}

export default function* updateProviderSaga() {
  yield takeLatest(UPDATE_PROVIDER_REQUEST, updateData)
}
