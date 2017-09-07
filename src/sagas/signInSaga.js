import 'babel-polyfill'
import { put, takeLatest, all } from 'redux-saga/effects'
import firebase from 'firebase'
import { userFetchRequested, postsFetchRequested, tokensUpdateRequested } from '../actions'
import { SIGN_IN_REQUESTED } from '../actions/types'
import helpers from '../helpers'

/*going to do without all of these constants
 * import {
  CREATE_USER,
  EMAIL,
  FACEBOOK,
  GITHUB,
  GOOGLE,
  NEW_EMAIL,
  PROVIDER,
  SUCCESS,
} from 'utils/constants'*/

//can probably remove this, and all calls to it
const success = data => ({ result: 'SUCCESS', user: data.user })

function* createUserWithEmail(data) {
  const password = Math.random().toString(36).slice(-8) 

  // The user data returned by firebase is one level flatter
  // than the user data for an existing user so we have to pass obj
  const createUserResult = yield firebase.auth()
    .createUserWithEmailAndPassword(data.email, password)
    .then((user) => {
      const userData = user
      userData.redirect = true
      userData.history = data.history
      return success({ user: userData })
    })

  return createUserResult
}

function* signInWithEmail(data) {
  const signInResult = yield firebase.auth()
    .signInWithEmailAndPassword(data.email, data.password)
    .then(user => success(user))

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

      return success( {user: result.user} )
    }).catch(function(error) {
      // Handle Errors here.
      //var errorCode = error.code;
      // The email of the user's account used.
      //var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      //var credential = error.credential;
      alert(`PROVIDER SIGN IN ERROR: ${error.message}`);
      helpers.handleError(error)
//TODO: need to alert the user better 
    }); 

  return signInResult
}

function* signIn(action) {
  try {
    const signInType = action.payload.signInType
    const credentials = action.payload.credentials
    const provider = action.payload.provider

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
      const user = signInResult.user
      let userProviders = []
      user.providerData && user.providerData.forEach((provider) => {
        userProviders.push(provider.providerId)
      })
      yield all([
        put(userFetchRequested(user)),
        put(postsFetchRequested(user)),
        put(tokensUpdateRequested({
          providerIds: userProviders, 
          credential: user.credential
        })),
      ])
      
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
