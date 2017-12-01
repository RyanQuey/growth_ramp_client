//not sure if this is being used
import {
  CREATE_POST_TEMPLATE_SUCCESS,
  UPDATE_POST_TEMPLATE_SUCCESS,
  SET_CURRENT_POST_TEMPLATE,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

const currentPostTemplateReducer = (state = null, action) => {

  let postTemplate
  switch (action.type) {

    case UPDATE_POST_TEMPLATE_SUCCESS:
      if (store.getState().currentPostTemplate.id === action.payload.id) {
        postTemplate = action.payload
        return Object.assign({}, postTemplate)
      } else {
        return state
      }

    case SET_CURRENT_POST_TEMPLATE:
      postTemplate = action.payload
      return Object.assign({}, postTemplate)

    //case CREATE_POST_TEMPLATE_SUCCESS:
      //postTemplate = action.payload
      //  return Object.assign({}, postTemplate)

    case SIGN_OUT_SUCCESS:
      return null

    default:
      return state
  }
}

export default currentPostTemplateReducer

