import {
  SET_CURRENT_WEBSITE,
  SIGN_OUT,
} from 'constants/actionTypes'

export default (state = null, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case SET_CURRENT_WEBSITE:
      return Object.assign({}, action.payload)

    default:
      return state
  }
}

