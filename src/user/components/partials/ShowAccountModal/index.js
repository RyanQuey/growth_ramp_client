import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import { CLOSE_MODAL, LINK_ACCOUNT_REQUEST, REFRESH_CHANNEL_TYPE_REQUEST } from 'constants/actionTypes'
import { SocialLogin } from 'shared/components/partials'
import { PermissionRow } from 'user/components/groups'
import { AccountCard } from 'user/components/partials'
import { Button, Form, Card, Flexbox } from 'shared/components/elements'
import { ButtonGroup } from 'shared/components/groups'
import { PROVIDERS } from 'constants/providers'
import { alertActions } from 'shared/actions'
import classes from './style.scss'


class ShowAccount extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loginPending: false,
      mode: 'CHOOSE_PROVIDER', //you do this or 'CHOOSE_SCOPE'
      channelTypes: [],
    }

    this.onSuccess = this.onSuccess.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.setPending = this.setPending.bind(this)
    this.chosenScopes = this.chosenScopes.bind(this)
    this.chooseChannel = this.chooseChannel.bind(this)
    this.refreshChannelType = this.refreshChannelType.bind(this)
  }

  handleClose (){
    this.props.closeModal()
  }

  chooseChannel(channelType) {
    this.setState({channelType})
  }

  onSuccess () {
    this.handleClose();

    if (typeof this.props.onSuccess === 'function') {
      this.props.onSuccess();
    }
  }
  setPending() {
    this.setState({loginPending: true})
  }

  chosenScopes() {
    //might make a helper function if I needed anywhere else
    //takes channelTypes and provider and returns the scopes needed for that channel
    const scopes = []
    const provider = this.state.currentProvider

    this.state.channelTypes.forEach((channel) => {
      const newScopes = PROVIDERS[provider].channelTypes[channel].filter((scope) => !scopes.includes(scope))
      scopes.push(...newScopes)
    })

    //removing duplicates
    return scopes
  }

  refreshChannelType(channelType) {
    this.setState({pending: true})
    const cb = () => {
      this.setState({pending: false})
      alertActions.newAlert({
        title: "Successfully refreshed channels",
        level: "SUCCESS",
      })
    }

    this.props.refreshChannelType(channelType, this.props.currentAccount, cb)
  }

  render (){
    //doesn't allow things to break and actually better performance
    const visible = this.props.currentModal === "ShowAccountModal"
    if (!visible) {
      return null
    }

    const account = this.props.currentAccount
    const provider = account.provider
    const providerName = PROVIDERS[provider].name
//might combine with potentialChannels somehow, or channelTypes
    const permittedChannelTypes = Helpers.permittedChannelTypes(account)

    const channels = account.channels

    return (
      <ModalContainer
        visible={visible}
        onClose={this.handleClose}
        title={`${account.userName || account.email}'s ${providerName} account`}
        headerImgUrl={account.photoUrl}
      >
        <ModalBody>

          <div>

            <div>
              <h2>Current Channel Types:</h2>
              {permittedChannelTypes.length ? (
                <div>
                  {permittedChannelTypes.map((channelType) => {
                    const channelTypeName = Helpers.channelTypeFriendlyName(null, provider, channelType)
                    const channelsForType = channels.filter((c) => c.type === channelType)
                    const canHaveMultiple = Helpers.channelTypeHasMultiple(null, provider, channelType)

                    return <div key={channelType}>
                      <h4>{channelTypeName}</h4>

                      {channelsForType.length ? (
                        channelsForType.map((c) =>
                          <div key={c.id}>
                            <strong></strong>&nbsp;<span>{c.name}</span>
                          </div>
                        )
                      ) : (
                        canHaveMultiple ? <div>None so far</div> : null
                      )}

                      {canHaveMultiple &&
                        <Button onClick={this.refreshChannelType.bind(this, channelType)}>
                          Refresh {channelTypeName} channels
                        </Button>
                      }

                    </div>
                  })}
                </div>
              ) : (
                <div>No permitted channels yet</div>
              )}
            </div>

          </div>
        </ModalBody>
      </ModalContainer>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: (payload) => dispatch({type: CLOSE_MODAL, payload}),
    linkAccountRequest: (payload) => dispatch({type: LINK_ACCOUNT_REQUEST, payload}),
    refreshChannelType: (channelType, account, cb) => dispatch({
      type: REFRESH_CHANNEL_TYPE_REQUEST,
      payload: {
        channelType,
        account,
      },
      cb,
    }),
  }
}
const mapStateToProps = (state) => {
  return {
    currentModal: state.viewSettings.currentModal,
    options: state.viewSettings.modalOptions || {},
    currentAccount: Helpers.safeDataPath(state.viewSettings, "modalOptions.currentAccount", {}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowAccount)
