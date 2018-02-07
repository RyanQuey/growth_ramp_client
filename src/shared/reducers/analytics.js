import {
  GET_ANALYTICS_SUCCESS,
} from 'constants/actionTypes'

const analyticsReducer = (state = {}, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case GET_ANALYTICS_SUCCESS:
      // a given GR user might have multiple google accounts
      let {dataset, data} = pld
      newState = Object.assign({}, state)

      newState[dataset] = data
      return newState

    case SIGN_OUT:
      return {}

    default:
      return state
  }
}

export default analyticsReducer

