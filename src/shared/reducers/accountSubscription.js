import {
  CHECK_STRIPE_STATUS_SUCCESS,
  CREATE_ACCOUNT_SUBSCRIPTION_SUCCESS,
  FETCH_ACCOUNT_SUBSCRIPTION_SUCCESS,
  CANCEL_ACCOUNT_SUBSCRIPTION_SUCCESS,
  UPDATE_ACCOUNT_SUBSCRIPTION_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

const accountSubscriptionReducer = (state = null, action) => {
  const pld = action.payload
  switch (action.type) {
    case CHECK_STRIPE_STATUS_SUCCESS:
      //payload should be the found accountsSubscription
      return Object.assign({}, pld)

    case CANCEL_ACCOUNT_SUBSCRIPTION_SUCCESS:
      //payload should be the found accountsSubscription
      return Object.assign({}, pld)

    case FETCH_ACCOUNT_SUBSCRIPTION_SUCCESS:
      //payload should be the found accountsSubscription
      return Object.assign({}, pld)

    case CREATE_ACCOUNT_SUBSCRIPTION_SUCCESS:
      //payload should be the new accountsSubscription
      return Object.assign({}, pld)

    case UPDATE_ACCOUNT_SUBSCRIPTION_SUCCESS:
      //payload should be the updated accountsSubscription
      return Object.assign({}, pld)

    case SIGN_OUT:
      return false

    default:
      return state
  }
}

export default accountSubscriptionReducer

