import analyticsHelpers from 'helpers/analyticsHelpers'
import {
  FETCH_CURRENT_AUDIT_SUCCESS,
  SET_CURRENT_AUDIT,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

export default (state = null, action) => {
  let newState, thisAudit, previousAudit, audits, auditsArr

  const pld = action.payload
  switch (action.type) {

    case FETCH_CURRENT_AUDIT_SUCCESS:
      thisAudit = pld;
      audits = store.getState().audits
      auditsArr = Object.keys(audits).map((id) => audits[id])
      previousAudit = thisAudit && analyticsHelpers.getLatestAuditBefore(auditsArr, {endDate: thisAudit.baseDate, websiteId: thisAudit.websiteId})
      return Object.assign({}, previousAudit)

    case SET_CURRENT_AUDIT:
      thisAudit = pld;
      audits = store.getState().audits
      auditsArr = Object.keys(audits).map((id) => audits[id])
      previousAudit = thisAudit && analyticsHelpers.getLatestAuditBefore(auditsArr, {endDate: thisAudit.baseDate, websiteId: thisAudit.websiteId})
      return Object.assign({}, previousAudit)

    case SIGN_OUT_SUCCESS:
      return null

    default:
      return state
  }
}



