import {
  GET_ANALYTICS_SUCCESS,
  SIGN_OUT_SUCCESS,
  SORT_GSC_ANALYTICS,
} from 'constants/actionTypes'

const analyticsReducer = (state = {}, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case GET_ANALYTICS_SUCCESS:
    case SORT_GSC_ANALYTICS:
      // a given GR user might have multiple google accounts
      let {dataset, results, filters} = pld
      if (typeof results === "object") {
        results.lastUsedFilters = filters
      }

      newState = Object.assign({}, state)

      newState[dataset] = results
      return newState

    case SIGN_OUT_SUCCESS:
      return {}

    default:
      return state
  }
}

export default analyticsReducer

