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
      loginPending: false
    }

    this.toggleView = this.toggleView.bind(this)
    this.setPending = this.setPending.bind(this)
  }
  componentWillReceiveProps (props) {
    const user = props.user
    const errors = Helpers.safeDataPath(props, 'errors.Login.onSubmit', false)

    if (errors.length > 0 || user && Object.keys(user).length >0) {
      this.setState({ signingIn: false });
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
  setPending() {
    this.setState({loginPending: true})
  }

  toggleView(e) {
    e.preventDefault()

    if (this.state.view === "SIGN_UP") {
      this.setState({view: "LOGIN"})
    } else {
      this.setState({view: "SIGN_UP"})
    }
  }

  render() {
    const view = this.state.view
    const generalText = view === "LOGIN" ? "Login" : "Sign Up"
    const socialText = view === "LOGIN" ? "Login" : "Create account"
    //TODO: set the title using props into the modal container

    return (
      <Flexbox className={classes.fields} direction="column" justify="center" align="center">
        <h1 color="primary">{generalText}</h1>
        <UserCredentials
          view={view}
          buttonText={generalText}
          pending={this.state.loginPending}
          setPending={this.setPending}
        />
        <br />
        <h3>Or {socialText.toLowerCase()} through one of your social networks:</h3>
        <br/>
        <SocialLogin
          loginPending={this.state.loginPending}
          setPending={this.setPending}
        />
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
  }
}

export default connect(mapStateToProps)(Login)
