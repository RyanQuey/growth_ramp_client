import {
  UPDATE_PROVIDER_SUCCESS,
  FETCH_PROVIDER_SUCCESS,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

const providersReducer = (state = {}, action) => {

  switch (action.type) {

    case SIGN_OUT_SUCCESS:
      return {}

    case UPDATE_PROVIDER_SUCCESS:
      return Object.assign({}, state, action.payload)

    case FETCH_PROVIDER_SUCCESS:
      return Object.assign({}, state, action.payload)

    default:
      return state
  }
}

export default providersReducer

