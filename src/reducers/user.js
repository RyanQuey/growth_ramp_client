import {
  INPUT_UPDATE_SUCCESSFUL,
  LOG_IN_WITH_PROVIDER,
  SET_CURRENT_USER,
  SET_IMAGE,
  SIGN_OUT,
  USER_FETCH_SUCCEEDED,
} from '../actions/types'

const userReducer = (state = null, action) => {

  switch (action.type) {
    case LOG_IN_WITH_PROVIDER:
      return action.payload

    case SET_CURRENT_USER:
      return action.payload

    case SET_IMAGE:
      return Object.assign({}, state, { [action.payload.name]: action.payload.url })

    case INPUT_UPDATE_SUCCESSFUL:
      return Object.assign({}, state, { [action.payload.name]: action.payload.value })

    case SIGN_OUT:
      console.log(" current state", state);

      return Object.assign({}, state) //need to remove the remove user from state somehow... Or do I? Whatever the case is, this is breaking

    case USER_FETCH_SUCCEEDED:
      console.log('Merge old and new user data:', action.payload)
      return Object.assign({}, state, action.payload)

    default:
      return state
  }
}

export default userReducer

