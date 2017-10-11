import {
  SET_CURRENT_MODAL,
  CLOSE_MODAL,
  SET_VIEW_MODE,
} from 'constants/actionTypes'

export const openModal = (modal) => {
  store.dispatch({
    type: SET_CURRENT_MODAL,
    payload: modal
  })
}

//alerts should be an array of alert ids, or 'all' to close all
export const closeModal = () => {
  //TODO: refresh modal state, including closing alerts for this modal
  //might do some of this within the component, but dry as much as possible
  store.dispatch({
    type: CLOSE_MODAL,
  })
}

// for every view mode, except for models
export const setViewMode = (mode) => {
  store.dispatch({
    type: SET_VIEW_MODE,
    payload: mode
  })
}
