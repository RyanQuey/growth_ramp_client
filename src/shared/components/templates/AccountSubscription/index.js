import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { viewSettingActions } from 'shared/actions'
import { Button, Flexbox, Input, Alert } from 'shared/components/elements'
import { PaymentDetailsWrapper, AccountSubscriptionPlans } from 'shared/components/partials'
import classes from './style.scss'
import { withRouter } from 'react-router-dom'
import {CHECK_STRIPE_STATUS_REQUEST} from 'constants/actionTypes'
import {ALLOWED_EMAILS, PAYMENT_PLANS} from 'constants/accountSubscriptions'

class AccountSubscription extends Component {
  constructor() {
    super()

    this.state = {
      pending: false,
      plansVisible: false,
      updatingCard: false,
    }

    this.togglePending = this.togglePending.bind(this)
    this.updatePlan = this.updatePlan.bind(this)
    this.togglePlans = this.togglePlans.bind(this)
    this.toggleUpdatingCard = this.toggleUpdatingCard.bind(this)
  }

  componentWillMount() {
    this.props.checkStripeStatus()
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  updatePlan () {
  }

  togglePlans (e) {
    e.preventDefault()
    this.setState({plansVisible: !this.state.plansVisible})
  }

  toggleUpdatingCard (value, e) {
    e && e.preventDefault()
    this.setState({updatingCard: value})
  }

  render (){
    // if it's set, use that, if it's not, show default
    let currentPaymentPlan = this.props.accountSubscription && this.props.accountSubscription.paymentPlan || (ALLOWED_EMAILS.includes(this.props.user.email) ? "prepaid" : "basic-monthly")

    const planText = `${PAYMENT_PLANS[currentPaymentPlan].name} ($${PAYMENT_PLANS[currentPaymentPlan].price}/${PAYMENT_PLANS[currentPaymentPlan].frequency})`
    const currentPaymentMethod = this.props.accountSubscription && this.props.accountSubscription.defaultSourceId ? `Credit card ending in ${this.props.accountSubscription.defaultSourceLastFour}` : "Payment method is not configured"

    return (
      <div>
        <div className={classes.formSection}>
          <div>
            <Flexbox justify="space-between">
              <div className={classes.settingLabel}>Current Plan:&nbsp;</div>
              <div className={classes.settingValue}>
                <div>{planText}</div>
                {false && <a href="#" className={classes.toggleButton} onClick={this.togglePlans}>View Payment Plans</a>}
              </div>
            </Flexbox>
          </div>
          {this.state.plansVisible && <div className={classes.expandedForm}>
            <AccountSubscriptionPlans
              updatePlan={this.updatePlan}
            />
          </div>}
        </div>

        <div className={classes.formSection}>
          <div>
            <Flexbox justify="space-between">
              <div className={classes.settingLabel}>Payment Method:&nbsp;</div>
              <div className={classes.settingValue}>
                <div>{currentPaymentMethod}</div>
                <a href="#" className={classes.toggleButton} onClick={this.toggleUpdatingCard.bind(this, !this.state.updatingCard)}>{!this.state.updatingCard ? "Update payment method" : "Cancel"}</a>
              </div>
            </Flexbox>
          </div>
          {this.state.updatingCard && <div className={classes.expandedForm}>
            <PaymentDetailsWrapper
              submitCb={this.toggleUpdatingCard.bind(this, false)}
              toggleUpdatingCard={this.toggleUpdatingCard}
            />
          </div>}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    errors: state.errors,
    user: state.user,
    accountSubscription: state.accountSubscription,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    checkStripeStatus: (cb, onFailure) => store.dispatch({type: CHECK_STRIPE_STATUS_REQUEST, cb, onFailure}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountSubscription)

