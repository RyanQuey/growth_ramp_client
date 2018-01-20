import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import { CLOSE_MODAL } from 'constants/actionTypes'
import { Button, Form, Card, Flexbox, Icon } from 'shared/components/elements'
import { ButtonGroup } from 'shared/components/groups'
import { UTM_TYPES, URL_LENGTH } from 'constants/posts'
import { UtmForm } from 'user/components/partials'
import { PROVIDERS } from 'constants/providers'
import classes from './style.scss'

class CreateLink extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pending: false,
      mode: 'CHOOSE_PROVIDER', //you do this or 'CHOOSE_SCOPE'
      currentProvider: 'FACEBOOK', //doesn't get used if pass in provider to the modal
      //currentAccount: Helpers.safeDataPath(props, "providerAccounts.FACEBOOK.0", false),
      channelTypes: [],
    }

    this.onSuccess = this.onSuccess.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.togglePending = this.togglePending.bind(this)
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
  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  render (){
    const {form, items} = this.props.options
    const params = this.props[`${form}Params`]

    return (
      <ModalContainer
        visible={this.props.currentModal === "CreateLinkModal"}
        onClose={this.handleClose}
        title={false && currentProviderName}
      >
        <ModalBody>
          <p>Create a link for this campaign to share on a channel Growth Ramp doesn't support</p>
          <UtmForm
            params={this.props}
            form={form}
            items={items}
          />
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
    campaignLinkParams: Helpers.safeDataPath(state.forms, "EditCampaign.posts.params", {}),
    PlanLinkParams: Helpers.safeDataPath(state.forms, "EditCampaign.posts.params", {}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateLink)
