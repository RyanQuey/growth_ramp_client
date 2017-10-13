import {
  CREATE_DRAFT_SUCCESS,
  INPUT_UPDATE_SUCCESS,
  LINK_ACCOUNT_SUCCESS,
  LOG_IN_WITH_PROVIDER,
  SET_CURRENT_USER,
  SET_IMAGE,
  SIGN_OUT,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_USER_SUCCESS,
  UPDATE_USER_SUCCESS,

} from 'constants/actionTypes'

const userReducer = (state = null, action) => {

  switch (action.type) {
    case LINK_ACCOUNT_SUCCESS:
      return Object.assign({}, state, { providerData: action.payload.providerData })

    case SET_CURRENT_USER:
      return Object.assign({}, action.payload)

    case UPDATE_USER_SUCCESS:
      return Object.assign({}, action.payload)

    case SET_IMAGE:
      return Object.assign({}, state, { [action.payload.name]: action.payload.url })

    case INPUT_UPDATE_SUCCESS:
      let pathArray = action.payload.path.split("/")
      let root = pathArray.shift()
      let relativePath = pathArray.join(".")
      if (root === "user") {
        let newState = Object.assign({}, state)
        _.set(newState, relativePath, action.payload.value)
        return newState
      } else {
        return state
      }

    case SIGN_OUT:
      return false

    case FETCH_CURRENT_USER_SUCCESS:
      return Object.assign({}, state, action.payload)

    default:
      return state
  }
}

export default userReducer

