import {
  CREATE_POST_SUCCESS,
  FETCH_POST_SUCCESS,
  INPUT_UPDATE_SUCCESS,
  SIGN_OUT,
} from '../actions'
import helpers from '../helpers'
import _ from 'lodash'

const postsReducer = (state = null, action) => {

  switch (action.type) {

    case INPUT_UPDATE_SUCCESS:
      let pathArray = action.payload.path.split("/")
      let root = pathArray.shift()
      let relativePath = pathArray.join(".")
      let value = action.payload.value
      if (root === "posts") {
        let newState = Object.assign({}, state)
        //when deleting a resource
        if (value === null) {
          _.unset(newState, relativePath)
        //when updating a resource
        } else {
          _.set(newState, relativePath, value)
        }

        return newState
      }

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

