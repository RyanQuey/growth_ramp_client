import {
  SET_CURRENT_USER,
  UPDATE_TOKEN_SUCCESS
} from 'constants/actionTypes'

export default () => {
  //pulls a global variable from the HTML file, what was dynamically rendered via the front end server
  //TODO: if I ever set other variables, change the way that these variables get passed around , so I don't have to parse more than once
  if (window.serverResponse && window.serverResponse.userAndProvider) {
    const data = JSON.parse(serverResponse.userAndProvider)

    //
    if (data) {
      store.dispatch({type: SET_CURRENT_USER, payload: data.user})

      const p = data.providerData
      const tokenInfo = {
        [p.name]: p
      }
      store.dispatch({type: UPDATE_TOKEN_SUCCESS, payload: tokenInfo})
    }
  }
}
