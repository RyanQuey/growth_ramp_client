import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { errorActions, alertActions } from 'shared/actions'
import { Button, Flexbox, Input, Checkbox } from 'shared/components/elements'
import {HANDLE_CREDIT_CARD_INFO_REQUEST} from 'constants/actionTypes'
import {  } from 'constants/actionTypes'
import {injectStripe, CardElement} from 'react-stripe-elements'

import classes from './style.scss'

//NOTE for testing: https://stripe.com/docs/testing

class PaymentDetails extends Component {
  constructor() {
    super()
    this.state = {
      pending: false,
      ready: false,
    }

    this.submit = this.submit.bind(this)
    this.onChange = this.onChange.bind(this)
    this.togglePending = this.togglePending.bind(this)
  }

  componentDidMount() {
    setTimeout(() => {
console.log("this runs");
      this.cardElement && this.cardElement.focus()
    }, 1500)
  }
  onChange({error, brand, empty, complete, value}) {
console.log(value);
    this.setState({ready: complete, postalCode: value.postalCode})
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  submit(e) {
    e.preventDefault()
    this.togglePending(true);
    alertActions.closeAlerts()

    let cb = (result) => {
      console.log("Successfully handled Credit card");
      console.log(result);
      this.cardElement.clear()
      this.togglePending(false)
      this.props.toggleUpdatingCard(false)

      alertActions.newAlert({
        title: "Successfully updated credit card",
        level: "SUCCESS",
      })
    }

    let onFailure = () => {
      this.togglePending(false)
    }

    //pulls some magic and grabs the data from the CardElement and sends to stripe api to create a source
    this.props.stripe.createSource(undefined, {owner: {address: {postal_code: this.state.postalCode}}})
    .then(({source, error}) => {
      console.log(source);
      if (error) { //TODO handle error
        throw error
      } else if (source.status !== "chargeable") {
        throw new Error(`The credit card you entered has the following status: ${source.status}. Please try a different credit card`)
      } else if (source.usage === "single_use") {
        throw new Error(`The credit card you entered is single use only. Please try a different credit card`)
      }

      this.props.handleCreditCardInfo(source, cb, onFailure)
    })
    .catch((err) => {
      errorActions.handleErrors({
        templateName: "PaymentDetails",
        templatePart: "creditCard",
        title: "Error in form",
        errorObject: err,
      })
    })
  }

  render() {
    return (
      <form className={classes.form} onSubmit={this.submit}>
        <div>Update your credit card info:</div>
        <CardElement
          elementRef={r => {this.cardElement = r}}
          onChange={this.onChange}
        />
        <Button
          disabled={!this.state.ready}
          type="submit"
          pending={this.state.pending}
        >
          Submit
        </Button>
      </form>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateUser: (userData, cb) => store.dispatch({type: UPDATE_USER_REQUEST, payload: userData, cb}),
    handleCreditCardInfo: (source, cb, onFailure) => store.dispatch({type: HANDLE_CREDIT_CARD_INFO_REQUEST, payload: {source}, cb, onFailure}),

  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    errors: Helpers.safeDataPath(state, "errors.Login.credentials", false),
    viewSettings: state.viewSettings,
    pricingPlan: Helpers.safeDataPath(state, "forms.PricingPlans.plan.params.pricingPlan", "")
  }
}

export default injectStripe(connect(mapStateToProps, mapDispatchToProps)(PaymentDetails))
