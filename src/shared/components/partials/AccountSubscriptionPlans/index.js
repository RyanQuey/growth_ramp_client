import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { errorActions, alertActions } from 'shared/actions'
import { Button, Flexbox, Input, Checkbox } from 'shared/components/elements'
import { SIGN_IN_REQUEST, UPDATE_USER_REQUEST, RESET_PASSWORD_REQUEST } from 'constants/actionTypes'

import classes from './style.scss'
import {ALLOWED_EMAILS} from 'constants/accountSubscriptions'

class AccountSubscriptionPlans extends Component {
  constructor() {
    super()
    this.state = {
    }

    this.submit = this.submit.bind(this)
  }

  submit(e) {
    e.preventDefault()

    formActions.setParams("AccountSubscriptionPlans", "plan", {pricingPlan: "standard-monthly"}) // $49/mo. won't use this if there was a button to actually pick plans, haha
    this.props.submitPricing()
  }

  handlePickPlan (value) {
    formActions.setParams("AccountSubscriptionPlans", "plan", {pricingPlan: value})
  }

  render() {
    return (
      <form onSubmit={this.submit}>
        <div>
          Pricing: $49/month
        </div>
        <Button
          type="submit"
        >
          Continue
        </Button>
      </form>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    errors: Helpers.safeDataPath(state, "errors.Login.credentials", false),
    viewSettings: state.viewSettings,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountSubscriptionPlans)
