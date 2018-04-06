import {
  FETCH_AUDIT_LIST_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

// namespaced by audit for organization / fast retrieval (note: potentially working with multiple audits at a time)
export default (state = {}, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    case FETCH_AUDIT_LIST_SUCCESS:
      let newState = Object.assign({}, state)
      for (let list of pld) {
        //remove populated data; store that in its own store
        let plainList = _.omit(list, ["auditListItems"])

        _.set(newState, `${list.auditId}.${list.id}`, plainList)
      }
      return newState

    case SIGN_OUT:
      return {}

    default:
      return state
  }
}

