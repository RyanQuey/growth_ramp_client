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
import { Button, Form, Card, Row } from 'shared/components/elements'
import { PROVIDERS } from 'constants/providers'

class LinkProviderAccount extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loginPending: false,
      mode: 'CHOOSE_PROVIDER', //you do this or 'CHOOSE_SCOPE'
      currentProvider: 'FACEBOOK',
      currentAccount: Helpers.safeDataPath(props, "providerAccounts.FACEBOOK.0", false),
      scopes: []
    }

    this.onSuccess = this.onSuccess.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.setPending = this.setPending.bind(this)
    this.chooseProvider = this.chooseProvider.bind(this)
    this.chooseAccount = this.chooseAccount.bind(this)
    this.brandNewAccount = this.brandNewAccount.bind(this)
  }
  handleClose (){
    this.props.closeModal()
  }

  chooseProvider(provider) {
    this.setState({
      mode: 'CHOOSE_SCOPE',
      currentProvider: provider,
      scopes: [],
    })
  }

  chooseAccount(account) {
    this.setState({currentAccount: account})
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

  //takes a list of scopes for an account and returns the list of available channels for that account
  permittedChannels(account) {
    if (!account || typeof account !== "object") {
      return []
    }
    const permittedScopes = Object.keys(account.scopes).filter((scope) => {
      return scope.status === 'granted'
    })

    const permittedChannels = Object.keys(PROVIDERS[account.provider].channels).filter((channel) => {
      const channelScopes = PROVIDERS[account.provider].channels[channel]
      return channelScopes.every((scope) => (permittedScopes.includes(scope))) //also returns true when the channel requires no scopes at all (empty array)
    })

    return permittedChannels
  }

  render (){
    const currentProvider = this.state.currentProvider
    const currentAccounts = Object.keys(this.props.providerAccounts).includes(currentProvider) ? this.props.providerAccounts[currentProvider] : null

    const permittedChannels = this.permittedChannels(this.state.currentAccount)

    return (
      <ModalContainer
        visible={this.props.currentModal === "LinkProviderAccountModal"}
        onClose={this.handleClose}
        title="Add an Account"
      >
        <ModalBody>
          <div>
            {Object.keys(PROVIDERS).map((provider) => {
              return (
                <Button
                  key={provider}
                  type="button"
                  className="btn-info btn-sm"
                  background="black"
                  onClick={this.chooseProvider.bind(this, provider)}>{provider.titleCase()}
                </Button>
              )
            })}
          </div>

          {currentProvider &&
            <Form>
              <h1>{PROVIDERS[currentProvider].name}</h1>
              <Row>
                <h3>Current Status</h3>
                {currentAccounts ? (
                  <div>
                    {currentAccounts.map((account) => (
                      <AccountStatus
                        onClick={this.chooseAccount.bind(this, account)}
                        account={account}
                        permittedChannels={permittedChannels}
                        key={account.providerUserId}
                        selected={this.state.currentAccount && this.state.currentAccount.id === account.id}/>
                    ))}
                    <Card onClick={this.brandNewAccount} selected={this.state.currentAccount === "new"}>
                      <p><strong>Want to add another {currentProvider} account?</strong>&nbsp;Make sure you are signed into {currentProvider} with the account you want to add to GrowthRamp, choose the services you want to allow here, and then click the login button below</p>
                    </Card>
                  </div>
                ) : (
                  <p>You don't have any {currentProvider} accounts linked to your GrowthRamp account yet.</p>
                )}

              </Row>
              <h3>Possible Channels to add:</h3>
              {Object.keys(PROVIDERS[this.state.currentProvider].channels).filter((channel) => !permittedChannels.includes(channel)).map((channel) => <div>{channel}</div>)}
              <SocialLogin
                loginPending={this.state.loginPending}
                setPending={this.setPending}
                providers={{[currentProvider]: PROVIDERS[currentProvider]}}
                scopes={this.state.scopes}
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
    providerAccounts: state.providerAccounts,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkProviderAccount)
