import {
  FETCH_AUDIT_LIST_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

// namespaced by list for organization / fast retrieval (note: potentially working with hundreds)
export default (state = {}, action) => {
  let newState

  const pld = action.payload
  switch (action.type) {

    // when fetching populated audit list, can set list items that way
    case FETCH_AUDIT_LIST_SUCCESS:
      let newState = Object.assign({}, state)
      for (let list of pld) {
        if (list.auditListItems) {
          if (!newState[list.id]) {
            newState[list.id] = {}
          }
          for (let item of list.auditListItems) {
            newState[list.id][item.id] = item
          }
        }
      }

      return newState

    case SIGN_OUT:
      return {}

    default:
      return state
  }
}



