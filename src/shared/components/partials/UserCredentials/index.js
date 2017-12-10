import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { errorActions, alertActions } from 'shared/actions'
import { Button, Flexbox, Input } from 'shared/components/elements'
import { SIGN_IN_REQUEST, UPDATE_USER_REQUEST, RESET_PASSWORD_REQUEST } from 'constants/actionTypes'

import classes from './style.scss'

class UserCredentials extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      validEmail: false,
      view: props.initialView || 'LOGIN',
    }

    this.submit = this.submit.bind(this)
    this.handleEmail = this.handleEmail.bind(this)
    this.handlePassword = this.handlePassword.bind(this)
  }
  componentWillReceiveProps(props) {
    if (props.errors && props.errors !== this.props.errors) {
      this.props.setPending(false);
    }
  }

  handlePassword(value, e, errors) {
    this.setState({
      password: value,
    })
  }
  handleEmail(value, e, errors) {
    this.setState({
      email: value,
      validEmail: (!errors || errors.length === 0),
    })
  }
  setPending() {
    this.props.setPending(true);
  }

  submit(e) {
    e.preventDefault()
    this.props.setPending(true);
    alertActions.closeAlerts()

    let password = this.state.password
    let email = this.state.email
    let token = this.props.viewSettings.modalToken
    let cb

    if (this.props.view === "SET_CREDENTIALS") {
      this.props.updateUser({
        password,
        email,
      })

    } else if (this.props.view === "RESETTING_PASSWORD") {
      cb = () => {
        this.props.setPending(false)
        this.setState({
          //change view to login
        })
      }
      this.props.resetPasswordRequest(email)

    } else {
      let signInType
      if (this.props.view === 'SIGN_UP') {
        signInType = 'SIGN_UP_WITH_EMAIL'
      } else {
        signInType = 'SIGN_IN_WITH_EMAIL'
      }

      const credentials = {email, password}
      //not a login token, but any other token that needs a logged in user for it to operate
      this.props.signInRequest(signInType, credentials, token)
    }
  }

  render() {
    const view = this.props.view
    //TODO: set the title using props into the modal container
    return (
      <form onSubmit={this.submit}>
        {!this.props.passwordOnly && (
          <Input
            color="primary"
            onChange={this.handleEmail}
            placeholder="your-email@gmail.com"
            type="email"
            value={this.state.email}
            validations={['required', 'email']}
          />
        )}

        {view !== "RESETTING_PASSWORD" &&
          <Input
            color="primary"
            onChange={this.handlePassword}
            placeholder="password"
            type="password"
            value={this.state.password}
            validations={['required', 'newPassword']}
          />
        }

        <Button
          disabled={(
            (!this.props.passwordOnly && !this.state.validEmail) ||
            (view !== "RESETTING_PASSWORD" && !this.state.password) ||
            this.props.pending
          )}
          type="submit"

        >
          {this.props.buttonText}
        </Button>
      </form>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateUser: (userData) => store.dispatch({type: UPDATE_USER_REQUEST, payload: userData}),
    signInRequest: (signInType, credentials, token) => store.dispatch({type: SIGN_IN_REQUEST, payload: {signInType, credentials, token}}),
    resetPasswordRequest: (email) => store.dispatch({type: RESET_PASSWORD_REQUEST, payload: email}),
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    errors: Helpers.safeDataPath(state, "errors.Login.credentials", false),
    viewSettings: state.viewSettings,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCredentials)
