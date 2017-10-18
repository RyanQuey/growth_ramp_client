import {
  CREATE_POST_SUCCESS,
  SET_POST,
  SIGN_OUT,
} from 'constants/actionTypes'

const currentPostReducer = (state = null, action) => {

  switch (action.type) {

    case CREATE_POST_SUCCESS:
      return Object.assign({}, action.payload)

    case SET_POST:
      return Object.assign({}, action.payload)

    case SIGN_OUT:
      return false

    default:
      return state
  }
}

export default currentPostReducer

