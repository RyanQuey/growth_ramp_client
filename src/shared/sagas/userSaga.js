import { call, put, takeLatest, all } from 'redux-saga/effects'
import {
  FETCH_USER_REQUEST,
  FETCH_CURRENT_USER_REQUEST,
  FETCH_USER_SUCCESS,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_PLAN_SUCCESS,
  FETCH_PROVIDER_SUCCESS,
  UPDATE_TOKEN_REQUEST,
  SIGN_IN_POPUP_CLOSED,
  SIGN_IN_REQUEST,
  SIGN_IN_SUCCESS,
  SIGN_IN_FAILURE,
  SIGN_OUT_REQUEST,
  SIGN_OUT_SUCCESS,
  SET_CURRENT_USER,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  HANDLE_ERRORS,
}  from 'constants/actionTypes'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP } from 'constants'
import { setupSession } from 'lib/socket'
import {errorActions} from 'shared/actions'

function* signIn(action) {
  const pld = action.payload
  try {
    const signInType = pld.signInType
    const credentials = pld.credentials
    //optional token, in case their login is also needed for the token to work
    const token = pld.token

    let result
    switch (signInType) {
      case 'SIGN_UP_WITH_EMAIL':
        result = yield axios.post("/api/users", {
          email: credentials.email,
          password: credentials.password
        })

        break
      case 'SIGN_IN_WITH_EMAIL':
        result = yield axios.post("/api/users/authenticate", {
          email: credentials.email,
          password: credentials.password,
          token,
        })
        break
      case 'SIGN_IN_WITH_TOKEN':
        result = yield axios.post("/api/users/authenticate", {
          loginToken: pld.loginToken,
        })
        break
    }
console.log(result);
    let user = result.data.userData
    let userPlans = result.data.plans
    let providerAccounts = result.data.providerAccounts

    if (user) {
      console.log(user);
      Cookie.set('sessionUser', result.user)
      //might make an alert here
      yield put({type: SIGN_IN_SUCCESS, payload: user})

      yield put({type: FETCH_PLAN_SUCCESS, payload: userPlans})
      yield put({type: FETCH_PROVIDER_SUCCESS, payload: providerAccounts})

    } else {
      //no user found
      //TODO: make a separate action for the error
console.log("no user or error returned...");
      yield put({type: SIGN_IN_FAILURE})
      errorActions.handleErrors({
        templateName: "Login",
        templatePart: "credentials",
        title: "Error signing in with credentials",
      })
    }


    return " all done"
  } catch (err) {
    console.log('Error in Sign In Saga', err)
    yield put({type: SIGN_IN_FAILURE})
    errorActions.handleErrors({
      templateName: "Login",
      templatePart: "credentials",
      title: "Error signing in with credentials",
    })
  }
}

//for fetching other users
function* fetchUser(action, options = {}) {
  try {
    const userData = action.payload
    const res = yield axios.get(`/api/users/${userData.id}`)
    //const res = yield api.put(`/api/users/`, userData)
    const returnedUser = res.data

    yield put({type: FETCH_USER_SUCCESS, payload: returnedUser})

  } catch (e) {
    yield Helpers.notifyOfAPIError(e)
  }
}
//should only be called on initial login, or retreating from cookies, etc.
function* fetchCurrentUser(action) {
  try {
    const userData = action.payload
    //TODO: also fetch the plans
    const res = yield axios.get(`/api/users/${userData.id}/initialUserData`)
    const result = res.data
    //no reason to restart the socket here; this event should only occur is already retrieving the user data from the cookie, which means that API token and headers already are set correctly.

    Cookie.set('sessionUser', result.user)
    yield put({type: FETCH_CURRENT_USER_SUCCESS, payload: result.user})
    yield put({type: FETCH_PROVIDER_SUCCESS, payload: result.providerAccounts})
    yield put({type: FETCH_PLAN_SUCCESS, payload: result.plans})

  } catch (e) {
    yield Helpers.notifyOfAPIError(e)
  }
}

function* signUserOut() {
  try {
    //actually call the signout
    //yield firebase.auth().signOut()
    //handle the successful signout

    Cookie.remove('sessionUser')
    Cookie.remove('requestedScopes')
    yield put({type: SIGN_OUT_SUCCESS, payload: true})
    yield axios.get(`/api/users/signOut`)

  } catch (e) {
    console.log('There was an error in the signUserOut:', e.message)
    errorActions.handleErrors({
      templateName: "Login",
      templatePart: "signout",
      title: "Error signing out",
    })
    //yield put(signOut('err'))
  }
}

function* updateUser(action) {
console.log("now updating user");
  try {
    const userData = action.payload
    const res = yield axios.put(`/api/users/${userData.id}`, userData)
    //const res = yield api.put(`/api/users/${userData.id}`, userData)
    const returnedUser = res.data
    yield put({type: UPDATE_USER_SUCCESS, payload: returnedUser})
  } catch (e) {
    errorActions.handleErrors({
      templateName: "User",
      templatePart: "update",
      title: "Error updating",
    })
  }
}

export default function* userSaga() {
  yield takeLatest(FETCH_USER_REQUEST, fetchUser)
  yield takeLatest(FETCH_CURRENT_USER_REQUEST, fetchCurrentUser)
  yield takeLatest(SIGN_IN_REQUEST, signIn)
  yield takeLatest(SIGN_OUT_REQUEST, signUserOut)
  yield takeLatest(UPDATE_USER_REQUEST, updateUser)
}
