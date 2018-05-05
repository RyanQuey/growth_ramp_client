import {
  FETCH_CURRENT_AUDIT_SUCCESS,
  SET_CURRENT_AUDIT,
  SET_CURRENT_WEBSITE,
  SIGN_OUT_SUCCESS,
  UPDATE_WEBSITE_SUCCESS,
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

    case UPDATE_WEBSITE_SUCCESS:
      if (pld.id === state.websiteId) {
        newState = Object.assign({}, state)
        // only change things if archived current audit
        if (pld.status === "ARCHIVED") {
          newState = null
        }

        return newState
      }

    case SIGN_OUT_SUCCESS:
      return null

    default:
      return state
  }
}

export default contentAuditReducer

