import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { errorActions } from 'shared/actions'
import { Button, Flexbox, Input } from 'shared/components/elements'
import { UPDATE_USER_REQUEST } from 'constants/actionTypes'

import classes from './style.scss'

class UserCredentials extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      validEmail: false,
      view: props.initialView || 'LOGIN',
      loginPending: false
    }

    this.submit = this.submit.bind(this)
    this.handleEmail = this.handleEmail.bind(this)
    this.handlePassword = this.handlePassword.bind(this)
  }

  handlePassword(e, errors) {
    this.setState({
      password: e.target.value,
    })
  }
  handleEmail(e, errors) {
    this.setState({
      email: e.target.value,
      validEmail: (errors.length === 0),
    })
  }
  setPending() {
    this.setState({loginPending: true})
  }

  submit(e) {
    e.preventDefault()
    this.props.setPending(true);

    if (this.props.view === "SET_CREDENTIALS") {
      this.props.updateUser({
        id: this.props.user.id,
        password: this.state.password,
        email: this.state.email
      })

    } else {
      let type
      if (this.props.view === 'SIGN_UP') {
        type = CREATE_WITH_EMAIL
      } else {
        type = EMAIL
      }
      /*userActions.signIn(
        type,
        {
          email: this.state.email,
          password: this.state.password,
          history: this.props.history,
        },
      )*/
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
            onChange={(e, errors) => this.handleEmail(e, errors)}
            placeholder="your-email@gmail.com"
            type="email"
            value={this.state.email}
            validations={['required', 'email']}
          />
        )}

        {["LOGIN", "SET_CREDENTIALS"].includes(view) && (
          <Input
            color="primary"
            onChange={(e, errors) => this.handlePassword(e, errors)}
            placeholder="password"
            type="password"
            value={this.state.password}
            validations={['required']}
          />
        )}

        <Button
          disabled={(!this.state.validEmail || !this.state.password || this.props.pending)}
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
    updateUser: (userData) => store.dispatch({type: UPDATE_USER_REQUEST, payload: userData})
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    errors: state.errors,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCredentials)
