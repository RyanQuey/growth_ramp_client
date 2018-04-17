import {
  FETCH_CURRENT_AUDIT_SUCCESS,
  SET_CURRENT_AUDIT,
  SET_CURRENT_WEBSITE,
  SIGN_OUT,
} from 'constants/actionTypes'

const contentAuditReducer = (state = null, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case FETCH_CURRENT_AUDIT_SUCCESS:
      return Object.assign({}, pld);

    case SET_CURRENT_AUDIT:
      return action.payload ? Object.assign({}, action.payload) : null

    case SET_CURRENT_WEBSITE:
      return null

    default:
      return state
  }
}

export default contentAuditReducer

