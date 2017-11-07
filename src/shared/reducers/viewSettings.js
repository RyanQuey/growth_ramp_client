import {
  SET_CURRENT_MODAL,
  CLOSE_MODAL,
  SET_VIEW_MODE,
} from 'constants/actionTypes'

//separate out by template the error was made in (even if it will be handled in a different template also)

export default (state = {}, action) => {
  switch (action.type) {
    //can also store a token if need to use the token when logging in, reseting password or whatever
    case SET_CURRENT_MODAL:
      return Object.assign({}, state, {currentModal: action.payload, modalToken: action.token, modalOptions: action.options})

    case CLOSE_MODAL:
      return Object.assign({}, state, {currentModal: false})

    case SET_VIEW_MODE:
      return Object.assign({}, state, {viewMode: action.payload})

    default:
      return state
  }
}

