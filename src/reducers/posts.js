import {
  POST_CREATE_SUCCEEDED,
  POSTS_FETCH_SUCCEEDED,
  INPUT_UPDATE_SUCCEEDED,
} from '../actions/types'
import helpers from '../helpers'
import _ from 'lodash'

const postsReducer = (state = null, action) => {

  switch (action.type) {

    case POST_CREATE_SUCCEEDED:
      return Object.assign({}, state, action.payload)

    case POSTS_FETCH_SUCCEEDED:
      return Object.assign({}, state, action.payload)

    case INPUT_UPDATE_SUCCEEDED:
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

    default:
      return state
  }
}

export default postsReducer

