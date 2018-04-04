import {
  FETCH_WEBSITE_SUCCESS,
  SIGN_OUT,
  REACTIVATE_OR_CREATE_WEBSITE_SUCCESS,
} from 'constants/actionTypes'

const websitesReducer = (state = {}, action) => {
  let newState, websites = [], googleUserAccounts, api

  const pld = action.payload
  switch (action.type) {

    case REACTIVATE_OR_CREATE_WEBSITE_SUCCESS:
      //add this site to the list
      newState = Object.assign({}, state)
      newState[pld.id] = pld
      return newState

    case FETCH_WEBSITE_SUCCESS:
      // a given GR user might have multiple websites eventually...for now, this should be array of one website
      newState = Object.assign({}, state)
      websites = pld || []
      for (let website of websites) {
        newState[website.id] = website
      }

      return newState

    case SIGN_OUT:
      return {}

    default:
      return state
  }
}

export default websitesReducer

