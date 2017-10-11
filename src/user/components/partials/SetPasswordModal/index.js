import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import { viewSettingActions } from 'shared/actions'

class SetPassword extends Component {
  constructor() {
    super()
    this.handleClose = this.handleClose.bind(this)
    this.handlePassword = this.handlePassword.bind(this)
  }
  handleClose (){
    viewSettingActions.closeModal()
  }
  handlePassword(e, errors) {
    this.setState({
      password: e.target.value,
    })
  }

  render (){
    return (
      <ModalContainer
        visible={this.props.currentModal === "UserLogin"}
        onClose={this.handleClose}
        disableClose={true}
        >
          <ModalBody>
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
                onClick={() => this.handleSubmit()}
                disabled={(this.props.errors)}
                type="submit"
              >
                Set Password
              </Button>
            </form>
        </ModalBody>
      </ModalContainer>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    currentModal: state.viewSettings.currentModal,
    errors: state.errors,
  }
}

export default connect(mapStateToProps)(SetPassword)

