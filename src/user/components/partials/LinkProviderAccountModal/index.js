import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import { CLOSE_MODAL, LINK_ACCOUNT_REQUEST } from 'constants/actionTypes'
import { SocialLogin } from 'shared/components/partials'
import { AccountCard } from 'user/components/partials'
import { Button, Form, Card, Flexbox } from 'shared/components/elements'
import { ButtonGroup } from 'shared/components/groups'
import { PROVIDERS } from 'constants/providers'

class LinkProviderAccount extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pending: false,
      mode: 'CHOOSE_PROVIDER', //you do this or 'CHOOSE_SCOPE'
      currentProvider: 'FACEBOOK',
      currentAccount: Helpers.safeDataPath(props, "providerAccounts.FACEBOOK.0", false),
      channels: [],
    }

    this.onSuccess = this.onSuccess.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.setPending = this.setPending.bind(this)
    this.chooseProvider = this.chooseProvider.bind(this)
    this.chosenScopes = this.chosenScopes.bind(this)
    this.chooseChannel = this.chooseChannel.bind(this)
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
  setPending() {
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
    const oneProviderOnly = this.props.options.provider  //mostly use as a Boolean
    const currentProvider = oneProviderOnly || this.state.currentProvider
    const currentAccounts = Object.keys(this.props.providerAccounts).includes(currentProvider) ? this.props.providerAccounts[currentProvider] : null
    const currentProviderName = PROVIDERS[currentProvider].name

    return (
      <ModalContainer
        visible={this.props.currentModal === "LinkProviderAccountModal"}
        onClose={this.handleClose}
        title={currentProviderName}
      >
        <ModalBody>
          {!oneProviderOnly &&
            <ButtonGroup>
              {Object.keys(PROVIDERS).map((provider) => {
                return (
                  <Button
                    key={provider}
                    selected={provider === currentProvider}
                    onClick={this.chooseProvider.bind(this, provider)}
                  >
                    {PROVIDERS[provider].name}
                  </Button>
                )
              })}
            </ButtonGroup>
          }

          {currentProvider &&
            <Form>
              <h3>{currentProviderName} Accounts ({currentAccounts ? currentAccounts.length : 0})</h3>
              <Flexbox>
                {currentAccounts ? (
                  currentAccounts.map((account) => (
                    <AccountCard
                      account={account}
                      key={account.providerUserId}
                      height="200px"
                    />
                  ))
                ) : (
                  <p>You don't have any {currentProviderName} accounts linked to your Growth Ramp account yet.</p>
                )}
              </Flexbox>

              <h3>Choose Channels to add:</h3>
              <Flexbox justify="center">
                {Object.keys(PROVIDERS[currentProvider].channels).map((channel) =>
                  <Button
                    key={channel}
                    style="inverted"
                    onClick={this.chooseChannel.bind(this, channel)}
                    selected={this.state.channels.includes(channel)}
                  >
                    {channel.titleCase()}
                  </Button>
                )}
              </Flexbox>
              <SocialLogin
                pending={this.state.pending}
                setPending={this.setPending}
                providers={{[currentProvider]: PROVIDERS[currentProvider]}}
                scopes={this.chosenScopes()}
                disabled={false}
              />

              <h5>Want to add another {currentProviderName} account?</h5>
              {["FACEBOOK", "LINKEDIN"].includes(currentProvider) && <p>Make sure you either logged out of {currentProviderName} or are signed into {currentProviderName} with the account you want to add to Growth Ramp, choose the services you want to allow here, and then click the login button below</p>}
            </Form>
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
    options: state.viewSettings.modalOptions || {},
    providerAccounts: state.providerAccounts,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkProviderAccount)
