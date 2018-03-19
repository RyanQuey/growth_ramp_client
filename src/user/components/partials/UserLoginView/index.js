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

class UserLoginView extends Component {
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
console.log(this.props.initialView);
    return (
      <Login
        modal={false}
        onSuccess={this.onSuccess}
        onCancel={this.handleClose}
        initialView={this.props.initialView}
      />
    )
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: (payload) => dispatch({type: CLOSE_MODAL, payload})
  }
}
const mapStateToProps = (state) => ({
  currentModal: state.viewSettings.currentModal,
  initialView: Helpers.safeDataPath(state, "viewSettings.Login.initialView", ""),
})

export default connect(mapStateToProps, mapDispatchToProps)(UserLoginView)
