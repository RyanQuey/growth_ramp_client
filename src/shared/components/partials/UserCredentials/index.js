import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { errorActions, alertActions, formActions } from 'shared/actions'
import { Button, Flexbox, Input, Checkbox } from 'shared/components/elements'
import { SIGN_IN_REQUEST, UPDATE_USER_REQUEST, RESET_PASSWORD_REQUEST } from 'constants/actionTypes'

import classes from './style.scss'
import theme from 'theme'

class UserCredentials extends Component {
  constructor(props) {
    super(props)
    this.state = {
      validEmail: true,
      view: props.initialView || 'LOGIN',
      acceptedTerms: false,
    }

    this.submit = this.submit.bind(this)
    this.handleEmail = this.handleEmail.bind(this)
    this.handlePassword = this.handlePassword.bind(this)
    this.toggleTos = this.toggleTos.bind(this)
    this.resetForm = this.resetForm.bind(this)
  }
  componentWillReceiveProps(props) {
    //(if logging in, and there's an error that's new, stop pending or else it might get stuck indeffinitely spinning)
    if (props.loginErrors && props.loginErrors !== this.props.loginErrors) {
      this.props.togglePending && this.props.togglePending(false);
    }
  }

  handlePassword(value, e, errors) {
    formActions.setParams("UserCredentials", "credentials", {password: value})
  }
  handleEmail(value, e, errors) {

    formActions.setParams("UserCredentials", "credentials", {email: value})
    this.setState({
      validEmail: (!errors || errors.length === 0),
    })
  }

  resetForm () {
    this.handlePassword("")
    this.handleEmail("")
  }

  toggleTos(value) {
    this.setState({acceptedTerms: value})
  }

  submit(e) {
    e.preventDefault()
    this.props.togglePending(true);
    alertActions.closeAlerts()

    let password = this.props.password
    let email = this.props.email
    let token = this.props.viewSettings.modalToken
    let cb

    if (this.props.view === "SET_CREDENTIALS") {
      // setting email and/or password
      let params = {}
      cb = () => {
        alertActions.newAlert({
          title: "Credentials successfully updated",
          level: "SUCCESS",
        })
        this.resetForm()
      }

      if (password) {params.password = password}
      if (email) {params.email = email}

      this.props.updateUser(params, cb)

    } else if (this.props.view === "RESETTING_PASSWORD") {
      cb = () => {
        this.props.togglePending(false)
        this.props.toggleView()
        this.resetForm()
      }

      this.props.resetPasswordRequest(email, cb)

    } else {
      //logging in or signingup
      cb = () => {
        this.props.togglePending(false)

        this.resetForm()
      }

      this.props.submit({cb})
    }
  }

  render() {
    const view = this.props.view
    let passwordValidations = ['required']
    if (view === "SIGN_UP") {passwordValidations.push("newPassword")}
    //TODO: set the title using props into the modal container

    const invalidFields = (
      (!this.props.passwordOnly && !this.state.validEmail) ||
      (view !== "RESETTING_PASSWORD" && this.props.loginErrors && this.props.loginErrors.length)
    )

    return (
      <form onSubmit={this.submit}>
        {!this.props.passwordOnly && (
          <Input
            containerClassName={classes.inputWrapper}
            className={classes.input}
            border={`2px solid ${theme.color.moduleGrayFour}`}
            onChange={this.handleEmail}
            placeholder="Email"
            type="email"
            value={this.props.email}
            validations={['required', 'email']}
            handleErrors={errors => errorActions.handleErrors(errors, "Login", "credentials", {alert: false})}
            noErrorMessage={true}
          />
        )}

        {view !== "RESETTING_PASSWORD" &&
          <Input
            containerClassName={classes.inputWrapper}
            className={classes.input}
            border={`2px solid ${theme.color.moduleGrayFour}`}
            onChange={this.handlePassword}
            placeholder="Password"
            type="password"
            value={this.props.password}
            validations={passwordValidations}
            handleErrors={errors => errorActions.handleErrors(errors, "Login", "credentials", {alert: false})}
            noErrorMessage={true}
          />
        }

        {view === "SIGN_UP" &&
          <div className={classes.termsOfService}>
            <Checkbox
              value={this.state.acceptedTerms}
              onChange={this.toggleTos}
              label="I accept Growth Ramp's"
            />&nbsp;
            <a href="/files/growth-ramp-terms-of-service.pdf" target="_blank">Terms of Service</a>

          </div>
        }
        <Button
          disabled={invalidFields || (view === "SIGN_UP" && !this.state.acceptedTerms)}
          type="submit"
          title={view === "SIGN_UP" && !this.state.acceptedTerms ? (
            "Please read and accept the terms of service before continuing"
          ) : (
            invalidFields ? "Fix in fields before continuing" : "Click here to sign up"
          )}
          pending={this.props.pending}
          style="attention"
        >
          {this.props.buttonText}
        </Button>
      </form>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateUser: (userData, cb) => store.dispatch({type: UPDATE_USER_REQUEST, payload: userData, cb}),
    resetPasswordRequest: (email, cb) => store.dispatch({type: RESET_PASSWORD_REQUEST, payload: email, cb}),

  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    loginErrors: Helpers.safeDataPath(state, "errors.Login.credentials", false),
    viewSettings: state.viewSettings,
    password: Helpers.safeDataPath(state, "forms.UserCredentials.credentials.params.password", ""),
    email: Helpers.safeDataPath(state, "forms.UserCredentials.credentials.params.email", ""),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCredentials)
