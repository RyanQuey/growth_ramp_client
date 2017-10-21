import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import { Login } from 'shared/components/partials'
import { CLOSE_MODAL } from 'constants/actionTypes'

class UserLogin extends Component {
  constructor() {
    super()
    this.onSuccess = this.onSuccess.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }
  handleClose (){
    this.props.closeModal()
  }

  onSuccess () {
    this.handleClose();

    if (typeof this.props.onSuccess === 'function') {
      this.props.onSuccess();
    }
  }

  render (){
    return (
      <ModalContainer
        visible={this.props.currentModal === "UserLoginModal"}
        onClose={this.handleClose}
        >
          <ModalBody>
            <Login modal={true} onSuccess={this.onSuccess} onCancel={this.handleClose} />
          </ModalBody>
      </ModalContainer>
    )
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: (payload) => dispatch({type: CLOSE_MODAL, payload})
  }
}
const mapStateToProps = (state) => {
  return { currentModal: state.viewSettings.currentModal }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserLogin)
