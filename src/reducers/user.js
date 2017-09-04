import {
  CREATE_DRAFT_SUCCEEDED,
  INPUT_UPDATE_SUCCEEDED,
  LOG_IN_WITH_PROVIDER,
  SET_CURRENT_USER,
  SET_IMAGE,
  SIGN_OUT,
  USER_FETCH_SUCCEEDED,
} from '../actions/types'
import helpers from '../helpers'
import _ from 'lodash'

const userReducer = (state = null, action) => {

  switch (action.type) {
    case LOG_IN_WITH_PROVIDER:
      return action.payload

    case SET_CURRENT_USER:
      return action.payload

    case SET_IMAGE:
      return Object.assign({}, state, { [action.payload.name]: action.payload.url })

    case INPUT_UPDATE_SUCCEEDED:
      let pathArray = action.payload.path.split("/")
      let root = pathArray.shift()
      let relativePath = pathArray.join(".")
      if (root === "user") {
        let newState = Object.assign({}, state)
        _.set(newState, relativePath, action.payload.value)
        return newState
      }

    case SIGN_OUT:

      return Object.assign({}, state) //need to remove the remove user from state somehow... Or do I? Whatever the case is, this is breaking

    case USER_FETCH_SUCCEEDED:
      return Object.assign({}, state, action.payload)

    default:
      return state
  }
}

export default userReducer

