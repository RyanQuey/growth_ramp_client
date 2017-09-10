import { IS_PRELOADING_STORE } from '../actions'

const preloadingReducer = (state = true, action) => {
  switch (action.type) {
    case IS_PRELOADING_STORE:
      return action.payload.preloadingData

    default:
      return state
  }
}

export default preloadingReducer
