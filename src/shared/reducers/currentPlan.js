import {
  CREATE_PLAN_SUCCESS,
  FETCH_PLAN_SUCCESS,
  UPDATE_PLAN_SUCCESS,
  INPUT_UPDATE_SUCCESS,
  SIGN_OUT,
  SET_CURRENT_PLAN, //probably eventually call this SET_PLAN
  SET_POST,
} from 'constants/actionTypes'

const currentPlanReducer = (state = null, action) => {

  switch (action.type) {

    case UPDATE_PLAN_SUCCESS:
      //payload should be the updated plan
      if (store.getState().currentPlan.id === action.payload.id) {
        return Object.assign({}, action.payload)
      } else {
        return state
      }

    case CREATE_PLAN_SUCCESS:
      //payload should be the new plan
      return Object.assign({}, action.payload)

    case SET_CURRENT_PLAN:
      return Object.assign({}, action.payload)

    //when setting post, set the current plan to the plan for that post
    case SET_POST:
      let plans = store.getState().plans
      let post = action.payload
      return Object.assign({}, plans[post.planId])

    case SIGN_OUT:
      return false

    default:
      return state
  }
}

export default currentPlanReducer

