import {
  SET_PARAMS,
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
      _.set(newState, `${pld.component}.${pld.form}`, {params: pld.params, dirty: true})

      return newState

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

