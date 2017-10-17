import {
  CREATE_PLAN_SUCCESS,
  FETCH_PLAN_SUCCESS,
  INPUT_UPDATE_SUCCESS,
  SIGN_OUT,
  CHOOSE_PLAN
} from 'constants/actionTypes'

const currentPlanReducer = (state = null, action) => {

  switch (action.type) {

    case CREATE_PLAN_SUCCESS:
      //payload should be the new plan
      return Object.assign({}, action.payload)

    case CHOOSE_PLAN:
      console.log("choose plan", action.payload);
      return Object.assign({}, action.payload)

    case SIGN_OUT:
      return false

    default:
      return state
  }
}

export default currentPlanReducer

