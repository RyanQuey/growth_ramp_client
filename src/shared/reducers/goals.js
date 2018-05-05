import {
  GET_GA_GOALS_SUCCESS,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

const contentAuditReducer = (state = {}, action) => {
  let newState, websiteId

  const pld = action.payload

  switch (action.type) {

    case GET_GA_GOALS_SUCCESS:
      websiteId = pld.params.websiteId
      return Object.assign({}, state, {[websiteId]: pld.results});

    case SIGN_OUT_SUCCESS:
      return {}

    default:
      return state
  }
}

export default contentAuditReducer

