import { take } from 'redux-saga/effects'
import {
  SET_CURRENT_USER,
  UPDATE_TOKEN_SUCCESS,
  HANDLE_QUERY,
} from 'constants/actionTypes'

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
        case "userAndProvider":
          const data = JSON.parse(value)
          const user = data.user
          const provider = data.providerData
          store.dispatch({type: SET_CURRENT_USER, payload: user})
          store.dispatch({type: UPDATE_TOKEN_SUCCESS, payload: { [provider.name]: provider}})
          break;

        case "providerData":
          break;
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
