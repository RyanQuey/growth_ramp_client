import {
  CREATE_POST_SUCCESS,
  UPDATE_POST_SUCCESS,
  FETCH_POST_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

const postsReducer = (state = {}, action) => {

  let post
  switch (action.type) {

    case FETCH_POST_SUCCESS:
      return Object.assign({}, action.payload)

    case CREATE_POST_SUCCESS:
      return Object.assign({}, state, action.payload)

    case UPDATE_POST_SUCCESS:
      post = action.payload
      return Object.assign({}, state, {[post.id]: post})

    case SIGN_OUT:
      return false

    default:
      return state
  }
}

export default postsReducer

