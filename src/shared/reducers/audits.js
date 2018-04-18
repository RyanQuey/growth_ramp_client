import {
  FETCH_AUDIT_SUCCESS,
  AUDIT_CONTENT_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

const auditReducer = (state = {}, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case FETCH_AUDIT_SUCCESS:
      newState = Object.assign({}, state)
      for (let audit of pld) {
        newState[audit.id] = audit
      }

      return newState
    case AUDIT_CONTENT_SUCCESS:
      newState = Object.assign({}, state)
      newState[pld.id] = pld

    case SIGN_OUT:
      return {}

    default:
      return state
  }
}

export default auditReducer

