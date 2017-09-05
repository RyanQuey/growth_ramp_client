import 'babel-polyfill'
import { put, takeLatest, all } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import firebase from 'firebase'
import { userFetchRequested, draftsFetchRequested, tokensUpdateRequested } from '../actions'
import { SIGN_IN_REQUESTED } from '../actions/types'
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

function* signInWithProvider(provider) {
  let authProvider

  switch (provider) {
    case 'FACEBOOK':
      authProvider = new firebase.auth.FacebookAuthProvider()
      break
    case 'GITHUB':
      authProvider = new firebase.auth.GithubAuthProvider()
      break
    case 'GOOGLE':
      authProvider = new firebase.auth.GoogleAuthProvider()
      break
  }

  const signInResult = yield firebase.auth()
    .signInWithPopup(authProvider)
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
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      console.log("PROVIDER SIGN IN ERROR:", error);
      alert("PROVIDER SIGN IN ERROR:", error.message);
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
console.log(user, signInResult);
      yield all([
        put(userFetchRequested(user)),
        put(draftsFetchRequested(user)),
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
