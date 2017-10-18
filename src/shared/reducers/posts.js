import {
  CREATE_POST_SUCCESS,
  FETCH_POST_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

const postsReducer = (state = {}, action) => {

  switch (action.type) {

    case FETCH_POST_SUCCESS:
      return Object.assign({}, state, action.payload)

    case CREATE_POST_SUCCESS:
      return Object.assign({}, state, action.payload)

    case SIGN_OUT:
      return false

    default:
      return state
  }
}

export default postsReducer

