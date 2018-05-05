import {
  SET_CURRENT_AUDIT_SECTION,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

const contentAuditReducer = (state = null, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case SET_CURRENT_AUDIT_SECTION:
      return action.payload

    case SIGN_OUT_SUCCESS:
      return null

    default:
      return state
  }
}

export default contentAuditReducer

