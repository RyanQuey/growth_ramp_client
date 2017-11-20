import {
  SET_PARAMS,
  FORM_PERSISTED,
  CLEAR_PARAMS,
} from 'constants/actionTypes'

//TODO probably make nested object like this in reducer
export const setParams = (component, form, params) => {
  const payload = {
    component,
    form,
    params,
  }

  store.dispatch({type: SET_PARAMS, payload })
}

export const formPersisted = (component, form) => {
  store.dispatch({
    type: FORM_PERSISTED,
    payload: {
      component,
      form,
    },
  })
}
export const clearParams = () => {
  store.dispatch({type: CLEAR_PARAMS})
}
