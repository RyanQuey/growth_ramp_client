import { call, put, takeLatest, all } from 'redux-saga/effects'
import {
  FETCH_USER_REQUEST,
  FETCH_CURRENT_USER_REQUEST,
  FETCH_USER_SUCCESS,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_POST_REQUEST,
  UPDATE_TOKEN_REQUEST,
  SIGN_IN_POPUP_CLOSED,
  SIGN_IN_REQUEST,
  SIGN_OUT_REQUEST,
  SIGN_OUT,
  SET_CURRENT_USER,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  HANDLE_ERRORS,
}  from 'constants/actionTypes'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP } from 'constants'
import { setupSession } from 'lib/socket'

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

function* setCookieAndSession (action) {
  const user = action.payload
  Cookie.set('sessionUser', user)

  setupSession(user)
}

function* fetchUser(action, options = {}) {
  try {
    const userData = action.payload
console.log(userData);
    const res = yield axios.get(`/api/users/${userData.id}`)
    //const result = yield api.put(`/api/users/`, userData)
console.log(res);
    const returnedUser = res.data

    if (options.currentUser) {
      //no reason to restart the socket; this event should only occur is already retrieving the user data from the cookie, which means that API token and headers already are set correctly.
      //for a new login, use SET_CURRENT_USER
      Cookie.set('sessionUser', returnedUser)
      yield put({type: FETCH_CURRENT_USER_SUCCESS, payload: returnedUser})
    } else {

      yield put({type: FETCH_USER_SUCCESS, payload: returnedUser})
    }
  } catch (e) {
    yield Helpers.notifyOfAPIError(e)
  }
}
function* fetchCurrentUser(action) {
  yield call(fetchUser, action, {currentUser: true})
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

function* updateUser(action) {
console.log("now updating user");
  try {
    const userData = action.payload
console.log(userData);
    const res = yield axios.put(`/api/users/${userData.id}`, userData)
    //const res = yield api.put(`/api/users/${userData.id}`, userData)
console.log(res);
    const returnedUser = res.data
    yield put({type: UPDATE_USER_SUCCESS, payload: returnedUser})
  } catch (e) {
    yield put({type: HANDLE_ERRORS, payload: e})
  }
}

export default function* userSaga() {
  yield takeLatest(FETCH_USER_REQUEST, fetchUser)
  yield takeLatest(FETCH_CURRENT_USER_REQUEST, fetchCurrentUser)
  yield takeLatest(SIGN_IN_REQUEST, signIn)
  yield takeLatest(SIGN_OUT_REQUEST, signUserOut)
  yield takeLatest(SET_CURRENT_USER, setCookieAndSession)
  yield takeLatest(UPDATE_USER_REQUEST, updateUser)
}
