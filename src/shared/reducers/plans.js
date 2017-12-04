import {
  CREATE_PLAN_SUCCESS,
  UPDATE_PLAN_SUCCESS,
  FETCH_PLAN_SUCCESS,
  INPUT_UPDATE_SUCCESS,
  SIGN_OUT_SUCCESS,
  ARCHIVE_PLAN_SUCCESS,
} from 'constants/actionTypes'

const plansReducer = (state = {}, action) => {
  let plan
  switch (action.type) {

    case CREATE_PLAN_SUCCESS:
      plan = action.payload
      return Object.assign({}, state, {[plan.id]: plan})

    case ARCHIVE_PLAN_SUCCESS:
      plan = action.payload
      let newState = Object.assign({}, state, {[plan.id]: plan})
      delete newState[plan.id]
      return newState

    case UPDATE_PLAN_SUCCESS:
      plan = action.payload
      return Object.assign({}, state, {[plan.id]: plan})

    case FETCH_PLAN_SUCCESS:
      return Object.assign({}, state, action.payload)

    case SIGN_OUT_SUCCESS:
      return {}
    default:
      return state
  }
}

export default plansReducer

