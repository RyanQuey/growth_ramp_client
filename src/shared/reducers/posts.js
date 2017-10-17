import {
  CREATE_POST_SUCCESS,
  FETCH_POST_SUCCESS,
  INPUT_UPDATE_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

const postsReducer = (state = {}, action) => {

  switch (action.type) {

    case CREATE_POST_SUCCESS:
      return Object.assign({}, state, action.payload)

    case FETCH_POST_SUCCESS:
      console.log("poststate", action.payload );
      return Object.assign({}, state, action.payload)

    case SIGN_OUT:
      return false

    default:
      return state
  }
}

export default postsReducer

