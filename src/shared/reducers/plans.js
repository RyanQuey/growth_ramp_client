import {
  CREATE_PLAN_SUCCESS,
  FETCH_PLAN_SUCCESS,
  INPUT_UPDATE_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

const plansReducer = (state = {}, action) => {

  switch (action.type) {

    case INPUT_UPDATE_SUCCESS:
      let pathArray = action.payload.path.split("/")
      let root = pathArray.shift()
      let relativePath = pathArray.join(".")
      let value = action.payload.value
      if (root === "plans") {
        let newState = Object.assign({}, state)
        //when deleting a resource
        if (value === null) {
          _.unset(newState, relativePath)
        //when updating a resource
        } else {
          _.set(newState, relativePath, value)
        }

        return newState
      }

    case CREATE_PLAN_SUCCESS:
      return Object.assign({}, state, action.payload)

    case FETCH_PLAN_SUCCESS:
      return Object.assign({}, state, action.payload)

    case SIGN_OUT:
      return false

    default:
      return state
  }
}

export default plansReducer
