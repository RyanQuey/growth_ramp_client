import {
  CREATE_POST_SUCCESS,
  UPDATE_POST_SUCCESS,
  SET_POST,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

const currentPostReducer = (state = null, action) => {

  switch (action.type) {

// NOTE just using params for now. Easier to track, alerts user what's happening too
    /*case CREATE_POST_SUCCESS:
      return Object.assign({}, action.payload)

    case UPDATE_POST_SUCCESS:
      if (store.getState().currentPost.id === action.payload.id) {
        return Object.assign({}, action.payload)
      } else {
        return state
      }

    case SET_POST:
      return Object.assign({}, action.payload)

    case SIGN_OUT_SUCCESS:
      return null*/

    default:
      return state
  }
}

export default currentPostReducer

