import {
  SET_PARAMS,
  SET_OPTIONS,
  CLEAR_PARAMS,
  FORM_PERSISTED,
} from 'constants/actionTypes'

//separate out by template the error was made in (even if it will be handled in a different template also)

export default (state = {}, action) => {
  const pld = action.payload
  let newState
  switch (action.type) {
    case SET_PARAMS:
      newState = Object.assign({}, state)
      let oldParams = Helpers.safeDataPath(state, `${pld.component}.${pld.form}.params`, {})
      let currentOptions = Helpers.safeDataPath(state, `${pld.component}.${pld.form}.options`, {})
      _.set(newState, `${pld.component}.${pld.form}`, {
        //merge the params in payload onto current params for this form
        params: Object.assign({}, oldParams, pld.params),
        dirty: pld.dirty,
        options: currentOptions,
      })
console.log(pld.params, newState);
      return newState

    case SET_OPTIONS:
      newState = Object.assign({}, state)
      let oldOptions = Helpers.safeDataPath(state, `${pld.component}.${pld.form}.options`, {})
      _.set(newState, `${pld.component}.${pld.form}.options`,
        //merge the options in payload onto current options for this form
        Object.assign({}, oldOptions, pld.options),
      )

      return newState

    //TODO conditionally clear only a certain form
    case CLEAR_PARAMS:
      return Object.assign({})

    case FORM_PERSISTED:
      newState = Object.assign({}, state)
      _.set(newState, `${pld.component}.${pld.form}.dirty`, false)

      return newState
    default:
      return state
  }
}

