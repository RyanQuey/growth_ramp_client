import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import { CLOSE_MODAL, LINK_ACCOUNT_REQUEST } from 'constants/actionTypes'
import { AccountCard, SavePlanFromCampaign } from 'user/components/partials'
import { Button, Form, Card, Flexbox, Icon } from 'shared/components/elements'
import { ButtonGroup } from 'shared/components/groups'
import { SocialLogin } from 'shared/components/partials'
import { PROVIDERS } from 'constants/providers'
import classes from './style.scss'

class ShowCampaign extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pending: false,
      savingPlanFromCampaign: false,
    }

    this.onSuccess = this.onSuccess.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.setPending = this.setPending.bind(this)
    this.chooseProvider = this.chooseProvider.bind(this)
    this.chosenScopes = this.chosenScopes.bind(this)
    this.chooseChannel = this.chooseChannel.bind(this)
    this.toggleSavingPlan = this.toggleSavingPlan.bind(this)
  }

  handleClose (){
    this.props.closeModal()
  }

  chooseProvider(provider) {
    this.setState({
      mode: 'CHOOSE_SCOPE',
      currentProvider: provider,
      channels: [],
    })
  }

  toggleSavingPlan(value = !this.state.savingPlanFromCampaign) {
    this.setState({savingPlanFromCampaign: value})
  }

  chooseChannel(channel) {
    let channels = this.state.channels

    if (channels.includes(channel)) {
      _.remove(channels, (c) => channel === c)
    } else {
      channels = channels.concat(channel)
    }

    this.setState({channels})
  }

  onSuccess () {
    this.handleClose();

    if (typeof this.props.onSuccess === 'function') {
      this.props.onSuccess();
    }
  }
  setPending(e) {
    this.setState({pending: true})
  }

  chosenScopes() {
    //might make a helper function if I needed anywhere else
    //takes channels and provider and returns the scopes needed for that channel
    const scopes = []
    const provider = this.state.currentProvider

    this.state.channels.forEach((channel) => {
      const newScopes = PROVIDERS[provider].channels[channel].filter((scope) => !scopes.includes(scope))
      scopes.push(...newScopes)
    })

    //removing duplicates
    return scopes
  }

  render (){
    const currentCampaign = this.props.currentCampaign || {}

    return (
      <ModalContainer
        visible={this.props.currentModal === "ShowCampaignModal"}
        onClose={this.handleClose}
        title={currentCampaign.name}
      >
        <ModalBody>

          {currentCampaign.posts ? (
            <div>
              <h2>Campaign Posts</h2>
              {currentCampaign.posts.map((post) =>
                <div>
                  <div><strong>Text:</strong>{post.text}</div>
                  <div><strong>Channel:</strong>{post.channel.titleCase()}</div>
                </div>
              )}
            </div>
          ) : (
            <div>
              No posts yet
            </div>
          )}

          <div><strong>Content Url:</strong>&nbsp;{currentCampaign.contentUrl}</div>


          {currentCampaign.status === "PUBLISHED" &&
            this.state.savingPlanFromCampaign ? (
              <div>
                <SavePlanFromCampaign />
                <Button onClick={this.toggleSavingPlan}>Cancel</Button>
              </div>
            ) : (
              <Button onClick={this.toggleSavingPlan}>Save plan from campaign?</Button>
            )}
          }
        </ModalBody>
      </ModalContainer>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: (payload) => dispatch({type: CLOSE_MODAL, payload}),
    linkAccountRequest: (payload) => dispatch({type: LINK_ACCOUNT_REQUEST, payload}),
  }
}
const mapStateToProps = (state) => {
  return {
    currentModal: state.viewSettings.currentModal,
    currentCampaign: state.currentCampaign,
    options: state.viewSettings.modalOptions || {},
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowCampaign)
