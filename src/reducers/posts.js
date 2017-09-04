import {
  CREATE_DRAFT_SUCCEEDED,
  DRAFTS_FETCH_SUCCEEDED,
  INPUT_UPDATE_SUCCEEDED,
} from '../actions/types'
import helpers from '../helpers'
import _ from 'lodash'

const draftsReducer = (state = null, action) => {

  switch (action.type) {

    case CREATE_DRAFT_SUCCEEDED:
      return Object.assign({}, state, action.payload)

    case DRAFTS_FETCH_SUCCEEDED:
      return Object.assign({}, state, action.payload)

    case INPUT_UPDATE_SUCCEEDED:
      let pathArray = action.payload.path.split("/")
      let root = pathArray.shift()
      let relativePath = pathArray.join(".")
      if (root === "posts") {
        let newState = Object.assign({}, state)
        _.set(newState, relativePath, action.payload.value)
        return newState
      }

    default:
      return state
  }
}

export default draftsReducer

