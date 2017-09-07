import 'babel-polyfill'
import firebase from 'firebase'
import { put, takeLatest, all } from 'redux-saga/effects'
import { userFetchRequested, postsFetchRequested, tokensUpdateRequested } from '../actions'
import { SIGN_IN_REQUESTED } from '../actions/types'
import helpers from '../helpers'

function* createUserWithEmail(data) {
  const password = Math.random().toString(36).slice(-8) 

  const createUserResult = yield firebase.auth()
    .createUserWithEmailAndPassword(data.email, password)
    .then((user) => {
      const userData = user
      userData.redirect = true
      userData.history = data.history
      return userData
    })

  return createUserResult
}

function* signInWithEmail(data) {
  const signInResult = yield firebase.auth().signInWithEmailAndPassword(data.email, data.password)

  return signInResult
}

function* signInWithProvider(providerName) {
  let provider

  switch (providerName) {
    case 'FACEBOOK':
      provider = new firebase.auth.FacebookAuthProvider()
      break
    case 'GITHUB':
      provider = new firebase.auth.GithubAuthProvider()
      break
    case 'GOOGLE':
      provider = new firebase.auth.GoogleAuthProvider()
      break
    case 'TWITTER':
      provider = new firebase.auth.TwitterAuthProvider()
      break
  }

  const signInResult = yield firebase.auth()
    .signInWithPopup(provider)
    .then((result) => {
 
      //will build off of this object and then send it
      let data = result.user
      data.credential = result.credential

      //  The signed-in user info.
      //  Only using this data for now, so assigning to the result.user
      data.redirect = true
      if (result.history) {
        data.history = result.history
      }

      return data
    }).catch(function(err) {
      // Handle Errors here.
      //var errorCode = error.code;
      // The email of the user's account used.
      //var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      //var credential = error.credential;

      helpers.handleError(err)
      alert(`PROVIDER SIGN IN ERROR: ${err.message}`);
//TODO: need to alert the user better 
    }); 

  return signInResult
}

function* signIn(action) {
  const pld = action.payload
  try {
    const signInType = pld.signInType
    const credentials = pld.credentials
    const provider = pld.provider

    let signInResult
    switch (signInType) {
      case 'CREATE_USER':
        signInResult = yield createUserWithEmail(credentials)
        break
      case 'EMAIL':
        signInResult = yield signInWithEmail(credentials)
        break
      case 'NEW_EMAIL':
        signInResult = yield createUserWithEmail(credentials)
        break
      case 'PROVIDER':
        signInResult = yield signInWithProvider(provider)
        break
    }

    if (signInResult) {
      console.log(signInResult);
      let userProviders = []
      signInResult.providerData && signInResult.providerData.forEach((provider) => {
        userProviders.push(provider.providerId)
      })

      if (pld.wantTokenOnly) {
        yield  put(tokensUpdateRequested({
          providerIds: userProviders, 
          credential: signInResult.credential
        }))

      //otherwise, get/set all user data
      } else {
        yield all([
          put(userFetchRequested(signInResult)),
          put(postsFetchRequested(signInResult)),
          put(tokensUpdateRequested({
            providerIds: userProviders, 
            credential: signInResult.credential
          })),
        ])
      }
      
    } else {
      //no user found
      //TODO: make a separate action for the error
      yield put(userFetchRequested(null))
    }
  } catch (err) {
    console.log('Error in Sign In Saga', err)
  }
}

export default function* signInSaga() {
  yield takeLatest(SIGN_IN_REQUESTED, signIn)
}
