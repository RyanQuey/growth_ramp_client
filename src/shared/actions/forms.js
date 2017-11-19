import {
  SET_PARAMS,
  CLEAR_PARAMS,
} from 'constants/actionTypes'

export const setParams = (component, form, value) => {
  const payload = {
    [component]: {
      [form]: {
        params: value,
        dirty: true,
      }
    }
  }

  store.dispatch({type: SET_PARAMS, payload })
}

export const clearParams = () => {
  store.dispatch({type: CLEAR_PARAMS})
}
