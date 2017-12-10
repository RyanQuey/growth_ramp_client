import { take } from 'redux-saga/effects'
import {
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_REQUEST,
  UPDATE_TOKEN_SUCCESS,
  HANDLE_QUERY,
  FETCH_PLAN_SUCCESS,
  SET_CURRENT_MODAL,
} from 'constants/actionTypes'
import { errorActions, alertActions } from 'shared/actions'
import { setupSession } from 'lib/socket'

const handleQuery = (rawQuery) => {
  //pulls a global variable from the HTML file, what was dynamically rendered via the front end server
  //TODO: if I ever set other variables, change the way that these variables get passed around , so I don't have to parse more than once
  if (rawQuery) {

    let cb
    const variables = rawQuery.replace(/^\?/, "").split('&')
    for (let i = 0; i < variables.length; i++) {
      try {
        const pair = variables[i].split('=')
        const key = decodeURIComponent(pair[0])
        const value = decodeURIComponent(pair[1])
        switch (key) {
          case "user":
            const userData = JSON.parse(value)

            if (
              !userData || !(typeof userData === "object") || Object.keys(userData).length === 0
            ) {
              Helpers.notifyOfAPIError({
                title: "Error logging in using provider:",
                message: "Please try again",
                templateName: "Home",
                templatePart: "noUser",
                alert: true
              })
              return
            }

            const user = userData.user ? userData.user : userData
            const userPlans = userData.plans ? userData.plans : null
            cb = () => {
              let cu = Cookie.get('sessionUser');
              alertActions.newAlert({
                title: "Success!",
                //TODO would send this even on signing in...eventually, be able to distinguish signing in and adding permissions for the message.
                //message: "Permissions granted for this platform",
                level: "SUCCESS",
              })
            }
            //setup the session
            setupSession(user)
            store.dispatch({type: FETCH_CURRENT_USER_REQUEST, payload: user, cb})

            break;

          case "token":
            const token = value

            //retrieve the token data and handle
            axios.post(`/api/tokens/${token}/useToken`)
            .then((result) => {
              console.log(result);
              if (result.data.result.code === "promptLogin") {
                store.dispatch({type: SET_CURRENT_MODAL, payload: "UserLoginModal", token: result.data.token, options: {credentialsOnly: true}})
              }
            })
            .catch((err) => {
              console.error(err);
              //need to test this. would be if user is not logged in while trying to use token
              if (err.code === 400) {
                console.log("for better");
                //prompt login
              }
            })

            break;

          case "alert":
            const alertType = value

            if (alertType === "canceledAuthorization") {
              alertActions.newAlert({
                title: "Warning:",
                message: "Permissions not granted",
                level: "WARNING",
              })
            }

            break;
        }

      } catch (err) {
        //TODO make an alert
        //I really just want to make provider stuff a popup...
        errorActions.handleErrors({
          title: "Error logging in using provider:",
          message: "Perhaps you tried linking an account that wasn't yours? Please try again",
          templateName: "Home",
          templatePart: "noUser",
          errorObject: err,
        }, null, null, {
          timer: false
        })
      }
    }
  }
}


export default function* handleQuerySaga() {
  //TODO only need to listen on initial page load
  while (true) {
    const action = yield take(HANDLE_QUERY)
    handleQuery(action.payload)
  }
}
