import {
  FETCH_CURRENT_AUDIT_SUCCESS,
  SET_CURRENT_AUDIT,
  SIGN_OUT,
} from 'constants/actionTypes'

const contentAuditReducer = (state = null, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case FETCH_CURRENT_AUDIT_SUCCESS:
      return Object.assign({}, pld);

    case SET_CURRENT_AUDIT:
      return Object.assign({}, action.payload)

    default:
      return state
  }
}

export default contentAuditReducer

