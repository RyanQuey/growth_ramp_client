import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import { CLOSE_MODAL, LINK_ACCOUNT_REQUEST, SET_CURRENT_MODAL } from 'constants/actionTypes'
import { AccountSubscription } from 'shared/components/partials'
import { Button, Form, Card, Flexbox, Icon } from 'shared/components/elements'
import { ButtonGroup } from 'shared/components/groups'
import { PROVIDERS } from 'constants/providers'
import classes from './style.scss'

class PaymentDetailsModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pending: false,
      mode: 'CHOOSE_PROVIDER', //you do this or 'CHOOSE_SCOPE'
    }

    this.onSuccess = this.onSuccess.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.togglePending = this.togglePending.bind(this)
  }

  handleClose (){
    //if has no channels, prompt user to link a new account
    if (!Helpers.allChannels().length) {
      store.dispatch({type: SET_CURRENT_MODAL, payload: "LinkProviderAccountModal"})
    } else {

      this.props.closeModal()
    }
  }

  onSuccess () {
    this.handleClose();

    if (typeof this.props.onSuccess === 'function') {
      this.props.onSuccess();
    }
  }
  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  render (){
    const oneProviderOnly = this.props.options.provider  //mostly use as a Boolean

    return (
      <ModalContainer
        visible={this.props.currentModal === "PaymentDetailsModal"}
        onClose={this.handleClose}
        title="Add Payment Details"
      >
        <ModalBody>
          <p>Payment is required before you can publish a campaign</p>
          <AccountSubscription />
        </ModalBody>
      </ModalContainer>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: (payload) => dispatch({type: CLOSE_MODAL, payload}),
  }
}
const mapStateToProps = (state) => {
  return {
    currentModal: state.viewSettings.currentModal,
    options: state.viewSettings.modalOptions || {},
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentDetailsModal)
