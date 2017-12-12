//not sure if this is being used
import {
  CREATE_POST_SUCCESS,
  UPDATE_POST_SUCCESS,
  SET_CURRENT_POST,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

const currentPostReducer = (state = null, action) => {

  let post
  switch (action.type) {

    case UPDATE_POST_SUCCESS:
      if (state && state.id === action.payload.id) {
        post = action.payload
        return Object.assign({}, post)
      } else {
        return state
      }

    case SET_CURRENT_POST:
      post = action.payload
      return post ? Object.assign({}, post) : null

    //case CREATE_POST_SUCCESS:
      //post = action.payload
      //  return Object.assign({}, post)

    case SIGN_OUT_SUCCESS:
      return null

    default:
      return state
  }
}

export default currentPostReducer

