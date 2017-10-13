import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { UPDATE_USER_REQUEST } from 'constants/actionTypes'
import { viewSettingActions } from 'shared/actions'
import { Button, Flexbox, Input } from 'shared/components/elements'
import classes from './style.scss'

class SetPasswordModal extends Component {
  constructor() {
    super()
    this.handleClose = this.handleClose.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handlePassword = this.handlePassword.bind(this)

    this.state = {
      password: "",
      pending: false,
    }
  }
  handleSubmit (e){
    e.preventDefault()
    this.props.updateUser({
      id: this.props.user.id,
      password: this.state.password,
    })

    this.setState({pending: true})
  }
  handlePassword(e, errors) {
    this.setState({
      password: e.target.value,
    })
  }

  render (){
    return (
      <div>
          <h1 color="primary">Welcome</h1>
          <form className={classes.form}>
            <h4>Please set your password before continuing:</h4>
            <Input
              color="primary"
              onChange={(e, errors) => this.handlePassword(e, errors)}
              placeholder="password"
              type="password"
              value={this.state.password}
              validations={['required']}
            />
            <Button
              onClick={this.handleSubmit}
              disabled={(this.props.errors && this.props.errors.length > 0 || false)}
              type="submit"
            >
              Set Password
            </Button>
          </form>
      </div>
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
    currentModal: state.viewSettings.currentModal,
    errors: state.errors,
    user: state.user,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SetPasswordModal)

