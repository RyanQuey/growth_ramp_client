import {
  CREATE_PLAN_SUCCESS,
  FETCH_PLAN_SUCCESS,
  CREATE_POST_TEMPLATE_SUCCESS,
  UPDATE_POST_TEMPLATE_SUCCESS,
  DESTROY_POST_TEMPLATE_SUCCESS,
  UPDATE_PLAN_SUCCESS,
  SIGN_OUT_SUCCESS,
  SET_CURRENT_PLAN, //probably eventually call this SET_PLAN
  SET_POST,
} from 'constants/actionTypes'


const currentPlanReducer = (state = null, action) => {
  let postTemplate, plan, oldPostTemplates, planPostTemplates, postTemplateIndex
  switch (action.type) {

    case UPDATE_PLAN_SUCCESS:
      //payload should be the updated plan
      if (state && state.id === action.payload.id) {
        return Object.assign({}, action.payload)
      } else {
        return state
      }

    case CREATE_POST_TEMPLATE_SUCCESS:
      postTemplate = action.payload
      if (postTemplate.planId === (state && state.id)) {
        plan = Object.assign({}, state)
        oldPostTemplates = plan.postTemplates || []
        planPostTemplates = [...oldPostTemplates]
        planPostTemplates.push(postTemplate)
        plan.postTemplates = planPostTemplates

        return Object.assign({}, plan)

      } else {
        return state
      }

    case UPDATE_POST_TEMPLATE_SUCCESS:
      if (state && state.id === action.payload.planId) {
        postTemplate = action.payload
        plan = Object.assign({}, state)
        oldPostTemplates = plan.postTemplates || []
        planPostTemplates = [...oldPostTemplates]
        postTemplateIndex = _.findIndex(planPostTemplates, (p) => p.id === postTemplate.id)


        //replaces that item in the array
        planPostTemplates.splice(postTemplateIndex, 1, postTemplate)
        plan.postTemplates = planPostTemplates

        return Object.assign({}, state, plan)

      } else {
        return state
      }

    case DESTROY_POST_TEMPLATE_SUCCESS:
      if (state && state.id === action.payload.planId) {
        postTemplate = action.payload
        plan = Object.assign({}, state)
        oldPostTemplates = plan.postTemplates || []
        //removes that item in the array, and any other archived ones
        planPostTemplates = [...oldPostTemplates.filter((p) => p.id !== postTemplate.id && p.status !== "ARCHIVED")]

        plan.postTemplates = planPostTemplates

        return Object.assign({}, state, plan)

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

    case SIGN_OUT_SUCCESS:
      return false

    default:
      return state
  }
}

export default currentPlanReducer

