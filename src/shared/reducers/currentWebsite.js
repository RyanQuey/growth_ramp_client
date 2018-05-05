import {
  SET_CURRENT_WEBSITE,
  UPDATE_WEBSITE_SUCCESS,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

export default (state = null, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case SET_CURRENT_WEBSITE:
      return pld ? Object.assign({}, action.payload) : null

    case UPDATE_WEBSITE_SUCCESS:
      if (pld.id === state.id) {
        newState = Object.assign({}, state)
        if (pld.status === "ARCHIVED") {
          newState = null
        } else {
          newState = pld
        }

        return newState
      }

    case SIGN_OUT_SUCCESS:
      return null

    default:
      return state
  }
}

