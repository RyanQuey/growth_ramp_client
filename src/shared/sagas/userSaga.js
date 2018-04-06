import { call, put, takeLatest, all } from 'redux-saga/effects'
import {
  FETCH_ACCOUNT_SUBSCRIPTION_SUCCESS,
  FETCH_USER_REQUEST,
  FETCH_CURRENT_USER_REQUEST,
  FETCH_USER_SUCCESS,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_PLAN_SUCCESS,
  FETCH_PROVIDER_SUCCESS,
  FETCH_WEBSITE_SUCCESS,
  HANDLE_ERRORS,
  INITIALIZE_USER_ACCOUNT_SUBSCRIPTION_REQUEST,
  REFRESH_CHANNEL_TYPE_REQUEST,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  SIGN_IN_POPUP_CLOSED,
  SIGN_IN_REQUEST,
  SIGN_IN_SUCCESS,
  SIGN_IN_FAILURE,
  SIGN_OUT_REQUEST,
  SIGN_OUT_SUCCESS,
  SET_CURRENT_USER,
  SET_CURRENT_MODAL,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
}  from 'constants/actionTypes'
import { USER_FIELDS_TO_PERSIST, PROVIDER_IDS_MAP } from 'constants'
import {ALLOWED_EMAILS} from 'constants/accountSubscriptions'
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

    let user = result.data.user ? result.data.user : result.data //ternary  necessary if provider login and waiting for the populated data from db (?)

    if (user) {
      _handleInitialUserData(result.data)

      yield put({type: SIGN_IN_SUCCESS, payload: user})
      alertActions.newAlert({
        title: "Welcome!",
        level: "SUCCESS",
        options: {}
      })

      action.cb && action.cb(result.data)

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

  } catch (err) {
    yield put({type: SIGN_IN_FAILURE})
    let httpStatus = err && Helpers.safeDataPath(err, "response.status", 500)
    //these are codes from our api
    let errorCode = err && Helpers.safeDataPath(err, "response.data.originalError.code", 500)
    let errorMessage = err && Helpers.safeDataPath(err, "response.data.originalError.message", 500)
    console.error(errorCode, errorMessage, err && err.response && err.response.data || err);

    if (httpStatus === 403) {
      alertActions.newAlert({
        title: "Invalid email or password",
        message: "Please try again",
        level: "WARNING",
        options: {timer: false},
      })

    } else if (errorCode === "unregistered-email" ){
      //not in our api to be accepted
      alertActions.newAlert({
        title: "Your account has not been registered in our system: ",
        message: "Please contact us at hello@growthramp.io to register and then try again.",
        level: "DANGER",
        options: {timer: false},
      })

    } else if (errorCode == "23505" ){ //original error.constraint should be "users_email_unique". Works because there are no other unique constraints sent by this form
      alertActions.newAlert({
        title: "Email already exists: ",
        message: "Please try logging in instead, or reset your password if you have forgotten it.",
        level: "DANGER",
        options: {timer: false},
      })

    } else {
      console.error('Error signing in/signing up', err)
      errorActions.handleErrors({
        templateName: "Login",
        templatePart: "credentials",
        title: "Error signing in:",
        errorObject: err,
        alert: true,
      }, null, null, {
        useInvalidAttributeMessage: true,
      })
    }
    action.onFailure && action.onFailure(err)

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
//should only be called on initial login, or retrieving from cookies, etc.
function* fetchCurrentUser(action) {
  try {
    const userData = action.payload
    //TODO: also fetch the plans
    const res = yield axios.get(`/api/users/${userData.id}/initialUserData`)
    const result = res.data

    //no reason to restart the socket here; this event should only occur is already retrieving the user data from the cookie, which means that API token and headers already are set correctly.
    _handleInitialUserData(result, {resetSocket: false})

    action.cb && action.cb(result.data)

  } catch (err) {
    errorActions.handleErrors({
      templateName: "Login",
      templatePart: "fetch",
      title: "Error while initializing",
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

    action.cb && action.cb(res.user)

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
      options: {timer: false},
    })
    action.cb && action.cb(res.user)

  } catch (err) {
    errorActions.handleErrors({
      templateName: "User",
      templatePart: "update",
      title: "Error resetting password",
      errorObject: err,
    })
  }
}

function _handleInitialUserData(data, options = {}) {
  if (options.keepHeaders) {
    Cookie.set('sessionUser', data.user)
  } else {
    setupSession(data.user)
  }
  store.dispatch({type: FETCH_CURRENT_USER_SUCCESS, payload: data.user})
  store.dispatch({type: FETCH_ACCOUNT_SUBSCRIPTION_SUCCESS, payload: data.accountSubscription})
  store.dispatch({type: FETCH_PROVIDER_SUCCESS, payload: data.providerAccounts})
  store.dispatch({type: FETCH_PLAN_SUCCESS, payload: data.plans})
  store.dispatch({type: FETCH_WEBSITE_SUCCESS, payload: data.websites})

  //refresh all channel lists
  //doesn't need to succeed; so don't raise error if doesn't necesarily, and make sure everything just moves forward
  //Also don't want this to slow down getting initial user, or cause it to fail, so don't want to do this in api as part of initialUserData call
  const providers = data.providerAccounts && Object.keys(data.providerAccounts) || {}
  const allAccounts = Helpers.flattenProviderAccounts()

  for (let account of allAccounts) {
    //map out channels
    //TODO make an api endpoint for refreshing all
    if (account.unsupportedProvider) {continue}

    let permittedChannels = Helpers.permittedChannelTypes(account)
    permittedChannels.forEach((channelType) => {
      const hasMultiple = Helpers.channelTypeHasMultiple(null, account.provider, channelType)
      if (hasMultiple) {
        store.dispatch({
          type: REFRESH_CHANNEL_TYPE_REQUEST,
          payload: {
            channelType: channelType,
            account,
          },
        })
      }
    })
  }

  //check if there's a stripe acct. If not, go make one real quick
  let accountSubscription = data.accountSubscription
  if (!accountSubscription) {
    //they don't have a customer record in stripe yet. Initialize for them
    //don't want this in afterCreate cb, since that would either delay the ttfb, or if stripe api is bugging, make things even worse, etc. So just do it here
    store.dispatch({type: INITIALIZE_USER_ACCOUNT_SUBSCRIPTION_REQUEST})
  }

  //set initial modal if necessary
  if (!ALLOWED_EMAILS.includes(data.user.email) && (
    !accountSubscription ||
    (
      accountSubscription.subscriptionStatus !== "active"
    )
  )) {
    store.dispatch({type: SET_CURRENT_MODAL, payload: "PaymentDetailsModal"})

  } else if (!Helpers.allChannels().length) {
    //if has no channels, prompt user to link a new account (assuming haven't prompted them to enter payment method already)
    store.dispatch({type: SET_CURRENT_MODAL, payload: "LinkProviderAccountModal"})
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
