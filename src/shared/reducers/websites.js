import {
  FETCH_WEBSITE_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

const websitesReducer = (state = {}, action) => {
  let newState, websites = [], googleUserAccounts, api

  const pld = action.payload
  switch (action.type) {

    case FETCH_WEBSITE_SUCCESS:
      // a given GR user might have multiple websites eventually...for now, this should be array of one website
      websites = pld || []

      return Object.assign({}, state, websites)

    case SIGN_OUT:
      return {}

    default:
      return state
  }
}

export default websitesReducer

