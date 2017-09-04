import {
  TOKENS_UPDATE_SUCCEEDED,
} from '../actions/types'

const tokensReducer = (state = null, action) => {

  switch (action.type) {

    case TOKENS_UPDATE_SUCCEEDED:
      console.log('Merge old and new token data:', action.payload)
      return Object.assign({}, state, action.payload)

    default:
      return state
  }
}

export default tokensReducer

