import {
  CREATE_DRAFT_SUCCEEDED,
  INPUT_UPDATE_SUCCEEDED,
  LINK_ACCOUNT_SUCCEEDED,
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
    case LINK_ACCOUNT_SUCCEEDED:
      return Object.assign({}, state, { providerData: action.payload.providerData })
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
      } else {
        return state
      }

    case SIGN_OUT:
      return false

    case USER_FETCH_SUCCEEDED:
      return Object.assign({}, state, action.payload)

    default:
      return state
  }
}

export default userReducer

