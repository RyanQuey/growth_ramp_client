import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { userActions, errorActions } from 'shared/actions'
import { Button, Flexbox, Input } from 'shared/components/elements'
import {
  SIGN_IN_REQUEST,
} from 'constants/actionTypes'
import { SocialLogin, UserCredentials } from 'shared/components/partials'
import { withRouter } from 'react-router-dom'

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
    this.submitCredentials = this.submitCredentials.bind(this)
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

//TODO just use a callback in the action
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
    e && e.preventDefault()

    let newView
    if (this.state.view === "LOGIN") {
      newView = "SIGN_UP"
    } else {
      newView = "LOGIN"
    }
    this.setState({view: newView})
    //clean up this so always uses props for view eventually. But for now, just trigger props function the login view
    this.props.changedView && this.props.changedView(newView)
  }

  setOnboardingStage(value) {
    this.setState({onboardingStage: value}) //CHOOSE_PRICING_PLAN, ADD_CARD, or ADD_CREDENTIALS
  }

  submitCredentials (options = {}) {
    let signInType
    if (this.state.view === "LOGIN"){
      signInType = 'SIGN_IN_WITH_EMAIL'

    } else if (this.state.view === 'SIGN_UP') {
      signInType = 'SIGN_UP_WITH_EMAIL'
    }

      //not a login token, but any other token that needs a logged in user for it to operate
    const token = this.props.viewSettings.modalToken
    const onFailure = () => {
      this.togglePending(false)
      options.onFailure && options.onFailure()
    }
    const cb = (allData) => {
      this.togglePending(false)
      options.cb && options.cb()
    }

    const credentials = {password: this.props.password, email: this.props.email}
    this.props.signInRequest(signInType, credentials, token, onFailure, cb)
  }

  render() {
    const view = this.state.view
    let generalText
    switch (view) {
      case "SIGN_UP":
        generalText = "Continue" //won't be used for a header
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
      <Flexbox className={classes.fields} direction="column" justify="inherit" align="center">
        {view !== "SIGN_UP" ? (
          <h1 color="primary">{generalText}</h1>
        ) : (
          <div className={classes.pricingInfo}>
            <h2 color="primary">Standard</h2>
            <div>$49 / Month</div>
          </div>
        )}
        <UserCredentials
          view={view}
          buttonText={generalText}
          pending={this.state.pending}
          token={this.props.viewSettings.modalToken}
          togglePending={this.togglePending}
          toggleView={this.toggleView}
          submit={this.submitCredentials}
        />
        {view === "LOGIN"  &&
          <a href="#" onClick={this.toggleResetPassword}>{this.state.resettingPassword ? "Login or signup" : "Forget your password?"}</a>
        }

        <br/>
        {!credentialsOnly && !resettingPassword && view === "LOGIN" && <div>
          <h3>{socialText} through one of your social networks:</h3>
          <SocialLogin
            pending={this.state.pending}
            togglePending={this.togglePending}
          />
        </div>}

        <br/>

        {false && "addthis back in once we have a more normal flow and remove other one" && <a
          onClick={this.toggleView}
          href="#"
        >
          {view === "LOGIN" ? (
            "Don't have an account? Click here to sign up"
          ) : (
            "Already have an account? Click here to login"
          )}
        </a>}

        {view === "LOGIN" ? (
          <a
            href="https://www.growthramp.io/seo-dashboard/"
          >
            Don't have an account? Click here to learn more
          </a>
        ) : (
          <a
            onClick={this.toggleView}
            href="#"
          >
            Already have an account? Click here to login
          </a>
        )}
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
    password: Helpers.safeDataPath(state, "forms.UserCredentials.credentials.params.password", ""),
    email: Helpers.safeDataPath(state, "forms.UserCredentials.credentials.params.email", ""),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signInRequest: (signInType, credentials, token, onFailure, cb) => store.dispatch({
      type: SIGN_IN_REQUEST,
      payload: {signInType, credentials, token},
      onFailure,
      cb,
    }),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login))
