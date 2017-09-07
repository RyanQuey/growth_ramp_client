import {
  TOKENS_UPDATE_SUCCEEDED,
  SIGN_OUT,
} from '../actions/types'

const tokensReducer = (state = null, action) => {

  switch (action.type) {

    case SIGN_OUT:
      return false

    case TOKENS_UPDATE_SUCCEEDED:
      console.log('Merge old and new token data:', action.payload)
      return Object.assign({}, state, action.payload)

    default:
      return state
  }
}

export default tokensReducer

