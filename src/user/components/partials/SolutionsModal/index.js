import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import {
  CLOSE_MODAL,
  SET_CURRENT_MODAL,
} from 'constants/actionTypes'
import { Button, Form, Card, Flexbox, Icon } from 'shared/components/elements'
import { ConfirmationPopup, Popup } from 'shared/components/groups'
import { formActions, alertActions } from 'shared/actions'
import { AUDIT_TESTS, getCustomListMetadata } from 'constants/auditTests'
import classes from './style.scss'

import pageSpeed from './PageSpeed'
import headlineStrength from './HeadlineStrength'
import browserCompatibility from './BrowserCompatibility'
import deviceCompatibility from './DeviceCompatibility'
import userInteraction from './UserInteraction'
import searchPositionToImprove from './SearchPositionToImprove'
import missingPages from './MissingPages'

const tags = {
  pageSpeed,
  headlineStrength,
  browserCompatibility,
  deviceCompatibility,
  userInteraction,
  searchPositionToImprove,
  missingPages,
}
class SolutionsModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pending: false,
      removingWebsite: false,
    }

    this.handleClose = this.handleClose.bind(this)
    this.togglePending = this.togglePending.bind(this)
  }

  componentWillReceiveProps(props) {
  }

  handleClose (){
    this.props.closeModal()
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  render (){
    const {testKey} = this.props

    const visible = this.props.currentModal === "SolutionsModal"

    if (!visible || !testKey) {
      return null
    }

    const Tag = tags[testKey]
    const title = AUDIT_TESTS[testKey].question
    return (
      <div className={classes.modal}>
        <ModalContainer
          visible={visible}
          onClose={this.handleClose}
          title={title}
        >
          <ModalBody>
            <div>
              <Tag />
            </div>
          </ModalBody>
        </ModalContainer>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: (payload) => dispatch({type: CLOSE_MODAL, payload}),
  }
}
const mapStateToProps = (state) => {
  const currentWebsite = Helpers.safeDataPath(state.viewSettings, "modalOptions.website")
  return {
    currentModal: state.viewSettings.currentModal,
    options: state.viewSettings.modalOptions || {},
    testKey: Helpers.safeDataPath(state, "viewSettings.modalOptions.testKey"),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SolutionsModal)
