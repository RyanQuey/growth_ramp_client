import analyticsHelpers from 'helpers/analyticsHelpers'
import {
  FETCH_CURRENT_AUDIT_SUCCESS,
  SET_CURRENT_AUDIT,
  SIGN_OUT,
} from 'constants/actionTypes'

export default (state = null, action) => {
  let newState, thisAudit, previousAudit

  const pld = action.payload
  switch (action.type) {

    case FETCH_CURRENT_AUDIT_SUCCESS:
      thisAudit = pld;
      previousAudit = analyticsHelpers.getLatestAuditBefore(thisAudit.createdAt)
      return Object.assign({}, previousAudit)

    case SET_CURRENT_AUDIT:
      thisAudit = pld;
      previousAudit = analyticsHelpers.getLatestAuditBefore(thisAudit.createdAt)
      return Object.assign({}, previousAudit)

    default:
      return state
  }
}



