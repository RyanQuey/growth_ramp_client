import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { errorActions, alertActions } from 'shared/actions'
import { Button, Flexbox, Input, Checkbox } from 'shared/components/elements'
import { SIGN_IN_REQUEST, UPDATE_USER_REQUEST, RESET_PASSWORD_REQUEST } from 'constants/actionTypes'
import {injectStripe, CardElement} from 'react-stripe-elements'

import classes from './style.scss'

class CheckoutForm extends Component {
  constructor() {
    super()
    this.state = {
    }

    this.submit = this.submit.bind(this)
  }

  submit(e) {
    e.preventDefault()
    this.props.togglePending(true);
    alertActions.closeAlerts()

    let cb

    let onFailure = () => {
      this.props.togglePending(false)
    }

    this.props.stripe.createToken({
      type: 'card',
      name: this.state.name,
    }).then((results) => {

    })
  }

  render() {
    return (
      <form onSubmit={this.submit}>
        <CardElement />
        <Input
          color="primary"
          onChange={this.handlePassword}
          placeholder="password"
          type="password"
          value={this.state.password}
          validations={[]}
          handleErrors={errors => errorActions.handleErrors(errors, "Login", "credentials", {alert: false})}
        />
        <div>
          <Checkbox
            value={this.state.acceptedTerms}
            onChange={this.toggleTos}
            label="I have read and agree to the"
          />&nbsp;
        </div>
        <Button
          disabled={(
            (!this.props.passwordOnly && !this.state.validEmail) ||
            (view !== "RESETTING_PASSWORD" && this.props.errors && this.props.errors.length) ||
            (view === "SIGN_UP" && !this.state.acceptedTerms)
          )}
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
    signInRequest: (signInType, credentials, token, onFailure) => store.dispatch({
      type: SIGN_IN_REQUEST,
      payload: {signInType, credentials, token},
      onFailure,
    }),
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

export default injectStripe(connect(mapStateToProps, mapDispatchToProps)(CheckoutForm))
