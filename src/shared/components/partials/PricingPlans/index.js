import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { errorActions, alertActions } from 'shared/actions'
import { Button, Flexbox, Input, Checkbox } from 'shared/components/elements'
import { SIGN_IN_REQUEST, UPDATE_USER_REQUEST, RESET_PASSWORD_REQUEST } from 'constants/actionTypes'
import {injectStripe, CardElement} from 'react-stripe-elements'

import classes from './style.scss'

class PricingPlans extends Component {
  constructor() {
    super()
    this.state = {
    }

    this.submit = this.submit.bind(this)
  }

  submit(e) {
    e.preventDefault()

    formActions.setParams("PricingPlans", "plan", {pricingPlan: "monthly.basic"}) // $49/mo. won't use this if there was a button to actually pick plans, haha
    this.props.submitPricing()
  }

  handlePickPlan (value) {
    formActions.setParams("PricingPlans", "plan", {pricingPlan: value})
  }

  render() {
    return (
      <form onSubmit={this.submit}>
        <div>
          <a href="/files/growth-ramp-terms-of-service.pdf" target="_blank">Terms of Service</a>
        </div>
        <Button
          type="submit"
        >
          Continue
        </Button>}
      </form>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    resetPasswordRequest: (email, cb) => store.dispatch({type: RESET_PASSWORD_REQUEST, payload: email, cb}),
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    errors: Helpers.safeDataPath(state, "errors.Login.credentials", false),
    viewSettings: state.viewSettings,
  }
}

export default injectStripe(connect(mapStateToProps, mapDispatchToProps)(PricingPlans))
