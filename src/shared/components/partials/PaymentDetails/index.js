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

  onChange({error, brand, empty, complete, value}) {
console.log(value);
    this.setState({ready: complete, postalCode: value})
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  submit(e) {
    e.preventDefault()
    this.togglePending(true);
    alertActions.closeAlerts()

    let cb = (result) => {
      console.log(result);
    }

    let onFailure = () => {
      this.props.togglePending(false)
    }


    const form = this.refs.cardForm

    this.props.stripe.createSource(this.refs.cardForm, {owner: {address: {postal_code: this.state.postalCode}}})
    .then(({source, error}) => {
      if (error) { //TODO handle error
        throw error
      }

console.log(form, source);

      this.props.handleCreditCardInfo(source, cb, onFailure)
    })
    .catch((err) => {
      console.eror(err);
      errorActions.handleErrors({
        templateName: "PaymentDetails",
        templatePart: "creditCard",
        title: "Error in form",
      })
    })
  }

  render() {
    return (
      <form className={classes.form} onSubmit={this.submit}>
        <div>Add your credit card info:</div>
        <CardElement
          ref="cardForm"
          onChange={this.onChange}
        />
        <Button
          disabled={!this.state.ready}
          type="submit"
          pending={this.props.pending}
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
    handleCreditCardInfo: (token, cb, onFailure) => store.dispatch({type: HANDLE_CREDIT_CARD_INFO_REQUEST, payload: {source}, cb, onFailure}),

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
