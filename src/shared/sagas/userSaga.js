import { call, put, takeLatest, all } from 'redux-saga/effects'
import {
  FETCH_USER_REQUEST,
  FETCH_CURRENT_USER_REQUEST,
  FETCH_USER_SUCCESS,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_PLAN_SUCCESS,
  FETCH_PROVIDER_SUCCESS,
  HANDLE_ERRORS,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  SIGN_IN_POPUP_CLOSED,
  SIGN_IN_REQUEST,
  SIGN_IN_SUCCESS,
  SIGN_IN_FAILURE,
  SIGN_OUT_REQUEST,
  SIGN_OUT_SUCCESS,
  SET_CURRENT_USER,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
}  from 'constants/actionTypes'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP } from 'constants'
import { setupSession } from 'lib/socket'
import { errorActions, alertActions } from 'shared/actions'

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

    let user = result.data.user ? result.data.user : result.data
    let userPlans = result.data.plans
    let providerAccounts = result.data.providerAccounts

    if (user) {
      setupSession(user)
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
    yield put({type: SIGN_IN_FAILURE})

    if (err && Helpers.safeDataPath(err, "response.status", 500) === 403) {
      alertActions.newAlert({
        title: "Invalid credentials",
        message: "Please try again",
        level: "WARNING",
        timer: false,
      })

    } else {
      console.log('Error signing in/signing up', err)
      errorActions.handleErrors({
        templateName: "Login",
        templatePart: "credentials",
        title: "Error signing in:",
        errorObject: err,
      }, null, null, {
        useInvalidAttributeMessage: true,
      })
    }
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

    action.cb && action.cb(result.user)

  } catch (err) {
    errorActions.handleErrors({
      templateName: "Login",
      templatePart: "fetch",
      title: "Error fetching user",
      errorObject: err,
    })
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

  } catch (err) {
    console.log('There was an error in the signUserOut:', err.message)
    errorActions.handleErrors({
      templateName: "Login",
      templatePart: "signout",
      title: "Error signing out",
      errorObject: err,
    })
    //yield put(signOut('err'))
  }
}

function* updateUser(action) {
  try {
    const userData = action.payload
    const userId = userData.userId || store.getState().user.id
    delete userData.id

    const res = yield axios.put(`/api/users/${userId}`, userData)
    //const res = yield api.put(`/api/users/${userData.id}`, userData)
    const returnedUser = res.data
    yield put({type: UPDATE_USER_SUCCESS, payload: returnedUser})

  } catch (err) {
    errorActions.handleErrors({
      templateName: "User",
      templatePart: "update",
      title: "Error:",
      errorObject: err,
    }, null, null, {
      useInvalidAttributeMessage: true,
    })
  }
}

function* resetPassword(action) {
  try {
    const email = action.payload
    const res = yield axios.post(`/api/users/resetPassword`, {email})
    yield put({type: RESET_PASSWORD_SUCCESS, payload: email})

    alertActions.newAlert({
      title: "Successfully reset password:",
      message: "Please check your e-mail for instructions to set your new password",
      level: "SUCCESS",
      timer: false,
    })
    action.cb && action.cb(result.user)

  } catch (err) {
    errorActions.handleErrors({
      templateName: "User",
      templatePart: "update",
      title: "Error resetting password",
      errorObject: err,
    })
  }
}

export default function* userSaga() {
  yield takeLatest(FETCH_USER_REQUEST, fetchUser)
  yield takeLatest(FETCH_CURRENT_USER_REQUEST, fetchCurrentUser)
  yield takeLatest(SIGN_IN_REQUEST, signIn)
  yield takeLatest(SIGN_OUT_REQUEST, signUserOut)
  yield takeLatest(UPDATE_USER_REQUEST, updateUser)
  yield takeLatest(RESET_PASSWORD_REQUEST, resetPassword)
}
