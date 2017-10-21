import {
  SET_VIEW_MODE,
} from 'constants/actionTypes'

// for every view mode, except for models
export const setViewMode = (mode) => {
  store.dispatch({
    type: SET_VIEW_MODE,
    payload: mode
  })
}
