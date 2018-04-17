import {
  CREATE_CUSTOM_LIST_SUCCESS,
  UPDATE_CUSTOM_LIST_SUCCESS,
  FETCH_CUSTOM_LIST_SUCCESS,
  SIGN_OUT_SUCCESS,
  SET_CURRENT_CUSTOM_LIST,
} from 'constants/actionTypes'

const customListsReducer = (state = {}, action) => {
  let customList, newState
  let pld = action.payload

  switch (action.type) {

    case FETCH_CUSTOM_LIST_SUCCESS:
      return Object.assign({}, pld)

    case CREATE_CUSTOM_LIST_SUCCESS:
      return Object.assign({}, state, {[pld.id]: pld})

    //assumes only updating one customList
    case UPDATE_CUSTOM_LIST_SUCCESS:
      newState = Object.assign({}, state)
      if (pld.status === "ARCHIVED") {
        delete newState[pld.id]
      } else {
        newState[pld.id] = pld
      }

      return newState

    case SIGN_OUT_SUCCESS:
      return {}

    default:
      return state
  }
}

export default customListsReducer

