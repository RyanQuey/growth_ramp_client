import {
  GET_ANALYTICS_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

const analyticsReducer = (state = {}, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case GET_ANALYTICS_SUCCESS:
      // a given GR user might have multiple google accounts
      let {dataset, results, filters} = pld
      results.lastUsedFilters = JSON.parse(filters)
      newState = Object.assign({}, state)

      newState[dataset] = results
      return newState

    case SIGN_OUT:
      return {}

    default:
      return state
  }
}

export default analyticsReducer

