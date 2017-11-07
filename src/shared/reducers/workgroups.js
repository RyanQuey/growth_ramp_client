import {
  CREATE_WORKGROUP_SUCCESS,
  UPDATE_WORKGROUP_SUCCESS,
  FETCH_WORKGROUP_SUCCESS,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

const workgroupsReducer = (state = {}, action) => {

  let workgroup
  switch (action.type) {

    case FETCH_WORKGROUP_SUCCESS:
      return Object.assign({}, action.payload)

    case CREATE_WORKGROUP_SUCCESS:
      workgroup = action.payload
      return Object.assign({}, state, {[workgroup.id]: workgroup})

    case UPDATE_WORKGROUP_SUCCESS:
      workgroup = action.payload
      return Object.assign({}, state, {[workgroup.id]: workgroup})

    case SIGN_OUT_SUCCESS:
      return {}

    default:
      return state
  }
}

export default workgroupsReducer

