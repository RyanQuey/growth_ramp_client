import {
  AUDIT_CONTENT_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

const contentAuditReducer = (state = {}, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case AUDIT_CONTENT_SUCCESS:
      return Object.assign({}, state, pld);

    case SIGN_OUT:
      return {}

    default:
      return state
  }
}

export default contentAuditReducer

