import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { errorActions, alertActions } from 'shared/actions'
import { Button, Flexbox, Input, Checkbox } from 'shared/components/elements'
import { SIGN_IN_REQUEST, UPDATE_USER_REQUEST, RESET_PASSWORD_REQUEST } from 'constants/actionTypes'

import classes from './style.scss'

class UserCredentials extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      validEmail: false,
      view: props.initialView || 'LOGIN',
      acceptedTerms: false,
    }

    this.submit = this.submit.bind(this)
    this.handleEmail = this.handleEmail.bind(this)
    this.handlePassword = this.handlePassword.bind(this)
    this.togglePending = this.togglePending.bind(this)
    this.toggleTos = this.toggleTos.bind(this)
  }
  componentWillReceiveProps(props) {
    //what is this/
    if (props.errors && props.errors !== this.props.errors) {
      this.props.togglePending && this.props.togglePending(false);
    }
  }

  handlePassword(value, e, errors) {
    errorActions.clearErrors ("Login", "credentials")

    this.setState({
      password: value,
    })
  }
  handleEmail(value, e, errors) {
    errorActions.clearErrors ("Login", "credentials")

    this.setState({
      email: value,
      validEmail: (!errors || errors.length === 0),
    })
  }
  togglePending() {
    this.props.togglePending(true);
  }

  toggleTos(value) {
    this.setState({acceptedTerms: value})
  }

  submit(e) {
    e.preventDefault()
    this.props.togglePending(true);
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
        this.props.togglePending(false)
        this.setState({
          //change view to login
        })
      }
      this.props.resetPasswordRequest(email, cb)

    } else {
      let signInType
      if (this.props.view === 'SIGN_UP') {
        signInType = 'SIGN_UP_WITH_EMAIL'
      } else {
        signInType = 'SIGN_IN_WITH_EMAIL'
      }

      let onFailure = () => {
        this.props.togglePending(false)
      }

      const credentials = {email, password}
      //not a login token, but any other token that needs a logged in user for it to operate
      this.props.signInRequest(signInType, credentials, token, onFailure)
    }
  }

  render() {
    const view = this.props.view
console.log(view);
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

        {view === "SIGN_UP" &&
          <div>
            <Checkbox
              value={this.state.acceptedTerms}
              onChange={this.toggleTos}
              label="I have read and agree to the"
            />&nbsp;
            <a href="/files/growth-ramp-terms-of-service.pdf" target="_blank">Terms of Service</a>

          </div>
        }
        <Button
          disabled={(
            (!this.props.passwordOnly && !this.state.validEmail) ||
            (view !== "RESETTING_PASSWORD" && !this.state.password) ||
            (view === "SIGN_UP" && !this.state.acceptedTerms)
          )}
          type="submit"
          pending={this.props.pending}
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

export default connect(mapStateToProps, mapDispatchToProps)(UserCredentials)
