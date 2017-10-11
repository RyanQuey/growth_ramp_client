import {
  CREATE_PLAN_SUCCESS,
  FETCH_PLAN_SUCCESS,
  INPUT_UPDATE_SUCCESS,
  SIGN_OUT,
  CHOOSE_PLAN
} from '../actions'
import helpers from '../helpers'
import _ from 'lodash'

const currentPlanReducer = (state = null, action) => {

  switch (action.type) {

    case INPUT_UPDATE_SUCCESS:
      // path should be like "plans/127$3451191/title etc"
      // TODO: make this less fragile by updating directly when plans overall get updated...(or maybe better, vice versa, so this gets going first?? )
      let pathArray = action.payload.path.split("/")
      let root = pathArray.shift()
      let planId = pathArray.shift()
      let relativePath = pathArray.join(".")
      let value = action.payload.value

      if (root === "plans" && planId === state.id) {
        let newState = Object.assign({}, state)
        _.set(newState, relativePath, value)

        return newState
      }
      return state;

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

