import { SET_PARAMS  } from 'constants/actionTypes'
//to be used for nested components to update store for a particular form
//payload should be in format {component: , form: , param: , value: }
//1) this is specifically for forms before submission 2) or for live, async submission, but keeping form values separate from db, so form can move faster than api calls
//the form as an object should be what is sent to teh backend, taking the different params and their values.
//don't get too crazy with this PLEASE

export default (state = {}, action) => {
  switch (action.type) {
    case SET_PARAMS:
      const pld = action.payload
      const ret = Object.assign({}, state)
      const updatedParams = _.set(ret, `${pld.component}.${pld.form}.${pld.param}`, pld.value)
      return updatedParams


    default:
      return state
  }
}

