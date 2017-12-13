import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { userActions, errorActions } from 'shared/actions'
import { Button, Flexbox, Input } from 'shared/components/elements'
import { SocialLogin, UserCredentials } from 'shared/components/partials'

import errorTypes from 'constants/errors'

import classes from './style.scss'

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: props.initialView || 'LOGIN',
      pending: false,
    }

    this.toggleView = this.toggleView.bind(this)
    this.togglePending = this.togglePending.bind(this)
    this.toggleResetPassword = this.toggleResetPassword.bind(this)
  }
  componentWillReceiveProps (props) {
    const user = props.user
    const errors = Helpers.safeDataPath(props, 'errors.Login.onSubmit', false)

    if (errors.length > 0 || user && Object.keys(user).length >0) {
      this.setState({ pending: false });
    }

    if (user && Object.keys(user).length > 0) {
      this.props.onSuccess();
    }

    errors && errors.forEach((err) => {
      if (err.type === errorTypes.RECORD_ALREADY_EXISTS.type) {
        let toReturn = {
          title: "Account already exists for this email",
          message: "Please try logging in instead"
        }
        errorActions(toReturn)

        this.setState({ view: 'LOGIN' });
      }
    })
  }
  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  toggleResetPassword(e) {
    e.preventDefault()
    this.setState({
      view: "RESETTING_PASSWORD",
    })
  }
  toggleView(e) {
    e.preventDefault()

    if (this.state.view === "LOGIN") {
      this.setState({view: "SIGN_UP"})
    } else {
      this.setState({view: "LOGIN"})
    }
  }

  render() {
    const view = this.state.view
    let generalText
    switch (view) {
      case "SIGN_UP":
        generalText = "Signup"
        break

      case "LOGIN":
        generalText = "Login"
        break

      case "RESETTING_PASSWORD":
        generalText = "Reset Password"
        break
    }

    const socialText = view === "LOGIN" ? "Login" : "Create account"
    const credentialsOnly = Helpers.safeDataPath(this.props, "viewSettings.modalOptions.credentialsOnly", false);
    const resettingPassword = view === "RESETTING_PASSWORD"
    //TODO: set the title using props into the modal container

    return (
      <Flexbox className={classes.fields} direction="column" justify="center" align="center">
        <h1 color="primary">{generalText}</h1>
        <UserCredentials
          view={view}
          buttonText={generalText}
          pending={this.state.pending}
          token={this.props.viewSettings.modalToken}
          togglePending={this.togglePending}
        />
        <br />
        {view === "LOGIN"  &&
          <a href="#" onClick={this.toggleResetPassword}>{this.state.resettingPassword ? "Login or signup" : "Forget your password?"}</a>
        }

        {!credentialsOnly && !resettingPassword && view === "LOGIN" && <div>
          <h3>Or {socialText.toLowerCase()} through one of your social networks:</h3>
          <br/>
          <SocialLogin
            pending={this.state.pending}
            togglePending={this.togglePending}
          />
        </div>}
        <a
          onClick={this.toggleView}
          href="#"
        >
          {view === "LOGIN" ? (
            "Don't have an account? Click here to sign up"
          ) : (
            "Already have an account? Click here to login"
          )}
        </a>
      </Flexbox>
    )
  }
}

Login.propTypes = {
  history: PropTypes.object,
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    errors: state.errors,
    viewSettings: state.viewSettings,
  }
}

export default connect(mapStateToProps)(Login)
