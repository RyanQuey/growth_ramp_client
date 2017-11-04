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
import { AccountStatus } from 'user/components/partials'
import { Button, Form, Card, Flexbox } from 'shared/components/elements'
import { ButtonGroup } from 'shared/components/groups'
import { PROVIDERS } from 'constants/providers'

class LinkProviderAccount extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loginPending: false,
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
    this.chooseAccount = this.chooseAccount.bind(this)
    this.chooseAccount = this.chooseAccount.bind(this)
    this.brandNewAccount = this.brandNewAccount.bind(this)
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

  chooseAccount(account) {
    this.setState({currentAccount: account})
  }

  chooseChannel(channel) {
    const channels = this.state.channels.concat(channel)
    this.setState({channels})
  }

  brandNewAccount() {
    this.setState({currentAccount: "new"})
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


    return (
      <ModalContainer
        visible={this.props.currentModal === "LinkProviderAccountModal"}
        onClose={this.handleClose}
        title={PROVIDERS[currentProvider].name}
      >
        <ModalBody>
          <ButtonGroup>
            {!oneProviderOnly && Object.keys(PROVIDERS).map((provider) => {
              return (
                <Button
                  key={provider}
                  type="button"
                  className="btn-info btn-sm"
                  background="black"
                  selected={provider === currentProvider}
                  onClick={this.chooseProvider.bind(this, provider)}
                >
                  {provider.titleCase()}
                </Button>
              )
            })}
          </ButtonGroup>

          {currentProvider &&
            <Form>
              <h3>Current Accounts</h3>
              <Flexbox>
                {currentAccounts ? (
                  currentAccounts.map((account) => (
                    <AccountStatus
                      account={account}
                      key={account.providerUserId}
                    />
                  ))
                ) : (
                  <p>You don't have any {currentProvider} accounts linked to your GrowthRamp account yet.</p>
                )}
              </Flexbox>
              <h5>Want to add another {currentProvider} account?</h5>
              {["FACEBOOK", "LINKEDIN"].includes(currentProvider) && <p>Make sure you either logged out of {currentProvider} or are signed into {currentProvider} with the account you want to add to GrowthRamp, choose the services you want to allow here, and then click the login button below</p>}


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
                loginPending={this.state.loginPending}
                setPending={this.setPending}
                providers={{[currentProvider]: PROVIDERS[currentProvider]}}
                scopes={this.chosenScopes()}
                disabled={this.state.currentAccount !== "new" && this.state.channels.length === 0}
              />
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
