import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { viewSettingActions } from 'shared/actions'
import { Button, Flexbox, Input, Alert, Icon } from 'shared/components/elements'
import { PaymentDetailsWrapper, AccountSubscriptionPlans } from 'shared/components/partials'
import classes from './style.scss'
import { withRouter } from 'react-router-dom'
import {
  CHECK_STRIPE_STATUS_REQUEST,
  CANCEL_ACCOUNT_SUBSCRIPTION_REQUEST,
  REACTIVATE_ACCOUNT_SUBSCRIPTION_REQUEST,
} from 'constants/actionTypes'
import {ALLOWED_EMAILS, PAYMENT_PLANS} from 'constants/accountSubscriptions'
import { errorActions, formActions, alertActions } from 'shared/actions'

class AccountSubscription extends Component {
  constructor() {
    super()

    this.state = {
      pending: false,
      plansVisible: false,
      updatingCard: false,
      cancellingPayment: false,
    }

    this.togglePending = this.togglePending.bind(this)
    this.reactivate = this.reactivate.bind(this)
    this.toggleCancellingPayment = this.toggleCancellingPayment.bind(this)
    this.cancelPayment = this.cancelPayment.bind(this)
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

  //cancels account before making next payment (ie, when next payment is due)
  cancelPayment() {
    this.togglePending(true)

    const cb = () => {
      this.togglePending(false)
      this.toggleCancellingPayment(false)
      alertActions.newAlert({
        title: "Successfully cancelled payment",
        level: "SUCCESS",
      })
    }

    const onFailure = () => {
      this.togglePending(false)
      alertActions.newAlert({
        title: "Unknown error cancelling payment: ",
        message: "Please contact support for help (hello@growthramp.io)",
        level: "DANGER",
      })
    }

    this.props.cancelPayment(cb, onFailure)
  }

  //reactivates cancelled account
  reactivate() {
    this.togglePending(true)

    const cb = () => {
      this.togglePending(false)
      alertActions.newAlert({
        title: "Successfully reactivated account",
        level: "SUCCESS",
      })
    }

    const onFailure = () => {
      this.togglePending(false)
      alertActions.newAlert({
        title: "Unknown error reactivating account: ",
        message: "Please contact support for help (hello@growthramp.io)",
        level: "DANGER",
      })
    }

    this.props.reactivateAccount(cb, onFailure)
  }

  toggleCancellingPayment(value, e) {
    e && e.preventDefault()
    this.setState({cancellingPayment: value})
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
    const {accountSubscription} = this.props

    // if it's set, use that, if it's not, show default
    let currentPaymentPlan = accountSubscription && accountSubscription.paymentPlan || (ALLOWED_EMAILS.includes(this.props.user.email) ? "prepaid" : "basic-monthly")

    const planText = `${PAYMENT_PLANS[currentPaymentPlan].name} ($${PAYMENT_PLANS[currentPaymentPlan].price}/${PAYMENT_PLANS[currentPaymentPlan].frequency})`
    const currentPaymentMethod = accountSubscription && accountSubscription.defaultSourceId ? `Credit card ending in ${accountSubscription.defaultSourceLastFour}` : "Payment method is not configured"

    if (!accountSubscription) {
      return <Icon name="spinner" size="5x"/>
    }

    return (
      <div>
        <div className={classes.formSection}>
          <Flexbox justify="space-between">
            <div className={classes.settingLabel}>Current Plan:&nbsp;</div>
            <div className={classes.settingValue}>
              <div>{planText}</div>
              {false && <a href="#" className={classes.toggleButton} onClick={this.togglePlans}>View Payment Plans</a>}
            </div>
          </Flexbox>
          {this.state.plansVisible && <div className={classes.expandedForm}>
            <AccountSubscriptionPlans
              updatePlan={this.updatePlan}
            />
          </div>}
        </div>

        <div className={classes.formSection}>
          <Flexbox justify="space-between">
            <div className={classes.settingLabel}>Payment Method:&nbsp;</div>
            <div className={classes.settingValue}>
              <div>{currentPaymentMethod}</div>
              <a href="#" className={classes.toggleButton} onClick={this.toggleUpdatingCard.bind(this, !this.state.updatingCard)}>{!this.state.updatingCard ? "Update payment method" : "Cancel"}</a>
            </div>
          </Flexbox>
          {this.state.updatingCard && <div className={classes.expandedForm}>
            <PaymentDetailsWrapper
              submitCb={this.toggleUpdatingCard.bind(this, false)}
              toggleUpdatingCard={this.toggleUpdatingCard}
            />
          </div>}
        </div>

        {accountSubscription && currentPaymentPlan !== "prepaid" && accountSubscription.currentPeriodEnd && <div className={classes.formSection}>
          <Flexbox justify="space-between">
            <div className={classes.settingLabel}>Next payment scheduled:&nbsp;</div>
            <div className={classes.settingValue}>
              {!accountSubscription.endedAt && accountSubscription.cancelAtPeriodEnd && <div>Subscription ending at {moment(accountSubscription.currentPeriodEnd).format("MM-DD-YYYY")}</div>}
              {accountSubscription.endedAt && <div>Subscription endied at {moment(accountSubscription.endedAt).format("MM-DD-YYYY")}</div>}
              {!accountSubscription.endedAt && !accountSubscription.cancelAtPeriodEnd && <div>{moment(accountSubscription.currentPeriodEnd).format("MM-DD-YYYY")}</div>}

              {accountSubscription.cancelAtPeriodEnd || accountSubscription.endedAt ? (
                <a href="#" className={classes.toggleButton} onClick={this.reactivate}>Reactivate account</a>
              ) : (
                <a href="#" className={classes.toggleButton} onClick={this.toggleCancellingPayment.bind(this, !this.state.cancellingPayment)}>{!this.state.cancellingPayment ? "Cancel next payment" : "Cancel"}</a>
              )}
            </div>
          </Flexbox>

          {this.state.cancellingPayment && <div className={classes.expandedForm}>
            <div>Are you sure you want to do this? You will no longer be able to publish campaigns after {moment(accountSubscription.currentPeriodEnd).format("MM-DD-YYYY")}.</div>
            <Button style="danger" onClick={this.cancelPayment} pending={this.state.pending}>Confirm</Button>
          </div>}
        </div>}
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
    cancelPayment: (cb, onFailure) => store.dispatch({type: CANCEL_ACCOUNT_SUBSCRIPTION_REQUEST, cb, onFailure}),
    reactivateAccount: (cb, onFailure) => store.dispatch({type: REACTIVATE_ACCOUNT_SUBSCRIPTION_REQUEST, cb, onFailure}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountSubscription)

