import { call, put, takeLatest, all } from 'redux-saga/effects'
import {
  FETCH_USER_REQUEST,
  FETCH_USER_SUCCESS,
  FETCH_POST_REQUEST,
  UPDATE_TOKEN_REQUEST,
  SIGN_IN_POPUP_CLOSED,
  SIGN_IN_REQUEST,
  SIGN_OUT_REQUEST,
  SIGN_OUT,
  SET_CURRENT_USER
}  from 'constants/actionTypes'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP } from 'constants'

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
  //request the provider information,
}

function* signIn(action) {
  const pld = action.payload
  try {
    const signInType = pld.signInType
    const credentials = pld.credentials
console.log(pld);
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

console.log(signInResult);
    if (signInResult) {
      console.log(signInResult, pld);
      let userProviders = []
      signInResult.providerData && signInResult.providerData.forEach((provider) => {
        userProviders.push(provider.providerId)
      })

      if (pld.wantTokenOnly) {
        yield  put({type: UPDATE_TOKEN_REQUEST, payload: {
          providerIds: userProviders,
          credential: signInResult.credential
        }})

      //otherwise, get/set all user data
      } else {
        yield all([
          put({type: FETCH_USER_REQUEST, payload: signInResult}),
          put({type: FETCH_POST_REQUEST, payload: signInResult}),
          put({type: UPDATE_TOKEN_REQUEST, payload: {
            providerIds: userProviders,
            credential: signInResult.credential
          }}),
        ])
      }
    } else {
      //no user found
      //TODO: make a separate action for the error
      //yield put(userFetchRequest(null))
    }
     return " all done"
  } catch (err) {
    console.log('Error in Sign In Saga', err)

  } finally {
    //this action is necessary to signal that it is finished, to consider that there are never 2 pop-ups open at the same time
    console.log("finished");
    yield put({type: SIGN_IN_POPUP_CLOSED, payload: undefined})
  }
}

const setCookie = (user) => {
  Cookie.set('sessionUser', user)
}

function* fetchData(action) {
}

function* signUserOut() {
  try {
    //actually call the signout
    //yield firebase.auth().signOut()
    //handle the successful signout
    yield put({type: SIGN_OUT, payload: true})

  } catch (e) {
    console.log('There was an error in the signUserOut:', e.message)
    //yield put(signOut('err'))
  }
}

export default function* userSaga() {
  yield takeLatest(FETCH_USER_REQUEST, fetchData)
  yield takeLatest(SIGN_IN_REQUEST, signIn)
  yield takeLatest(SIGN_OUT_REQUEST, signUserOut)
  yield takeLatest(SET_CURRENT_USER, setCookie)
}
