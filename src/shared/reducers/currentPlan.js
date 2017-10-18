import {
  CREATE_PLAN_SUCCESS,
  FETCH_PLAN_SUCCESS,
  INPUT_UPDATE_SUCCESS,
  SIGN_OUT,
  CHOOSE_PLAN, //probably eventually call this SET_PLAN
  SET_POST,
} from 'constants/actionTypes'

const currentPlanReducer = (state = null, action) => {

  switch (action.type) {

    case CREATE_PLAN_SUCCESS:
      //payload should be the new plan
      return Object.assign({}, action.payload)

    case CHOOSE_PLAN:
      return Object.assign({}, action.payload)

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

