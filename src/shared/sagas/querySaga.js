import { take } from 'redux-saga/effects'
import {
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_REQUEST,
  UPDATE_TOKEN_SUCCESS,
  HANDLE_QUERY,
  FETCH_PLAN_SUCCESS,
} from 'constants/actionTypes'
import { setupSession } from 'lib/socket'

const handleQuery = (rawQuery) => {
  //pulls a global variable from the HTML file, what was dynamically rendered via the front end server
  //TODO: if I ever set other variables, change the way that these variables get passed around , so I don't have to parse more than once
  if (rawQuery) {
    const variables = rawQuery.replace(/^\?/, "").split('&')
    for (let i = 0; i < variables.length; i++) {
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

          //setup the session
          setupSession(user)
          store.dispatch({type: FETCH_CURRENT_USER_REQUEST, payload: user})

          break;

        /*case "providers:
          const provider = JSON.parse(value)

          if (
            !provider || !(typeof provider === "object") || Object.keys(provider).length === 0
          ) {
            Helpers.notifyOfAPIError({
              title: "Error logging in using provider:",
              message: "Please try again",
              templateName: "Home",
              templatePart: "noProvider",
              alert: true
            })
            return
          }

          store.dispatch({type: UPDATE_TOKEN_SUCCESS, payload: { [provider.name]: provider}})
          break;*/

      }
    }
  }
}


export default function* handleQuerySaga() {
  while (true) {
    const action = yield take(HANDLE_QUERY)
    handleQuery(action.payload)
  }
}
