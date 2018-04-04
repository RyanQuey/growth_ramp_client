import {
  FETCH_AUDIT_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

const contentAuditReducer = (state = {}, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case FETCH_AUDIT_SUCCESS:
      newState = Object.assign({}, state)
      for (let audit of pld) {
        newState[audit.id] = audit
      }

      return newState

    case SIGN_OUT:
      return {}

    default:
      return state
  }
}

export default contentAuditReducer

