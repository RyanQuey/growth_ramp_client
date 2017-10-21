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
import { Button } from 'shared/components/elements'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'

class LinkProviderAccount extends Component {
  constructor() {
    super()

    this.state = {
      loginPending: false,
      mode: 'CHOOSE_PROVIDER', //you do this or 'CHOOSE_SCOPE'
      currentProvider: '',
      scopes: []
    }

    this.onSuccess = this.onSuccess.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.setPending = this.setPending.bind(this)
    this.chooseProvider = this.chooseProvider.bind(this)
    this.convertScopesToChannels = this.convertScopesToChannels.bind(this)
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
  convertScopesToChannels(provider, scopes) {
    const permittedScopes = Object.keys(scopes).filter((scope) => {
      return scope.status === 'granted'
    })

    const permittedChannels = Object.keys(PROVIDERS[provider].channels).filter((channel) => {
      const channelScopes = PROVIDERS[provider].channels[channel]
      return channelScopes.every((scope) => (permittedScopes.includes(scope))) //also returns true when the channel requires no scopes at all (empty array)
    })

console.log(permittedChannels);
    return permittedChannels
  }

  render (){
    const currentProvider = this.state.currentProvider
    const currentAccounts = Object.keys(this.props.providerAccounts).includes(currentProvider) ? this.props.providerAccounts[currentProvider] : null

    return (
      <ModalContainer
        visible={this.props.currentModal === "LinkProviderAccountModal"}
        onClose={this.handleClose}
      >
        <ModalBody>
          <div>
            <h3>Select a platform to add</h3>
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
            <form>
              <h1>{PROVIDERS[currentProvider].name}</h1>
              <div>
                <h3>Current Status</h3>
                {currentAccounts ? (
                  <div>
                    {currentAccounts.map((account) => {
                      const permittedChannels = this.convertScopesToChannels(currentProvider, account.scopes)
                      return (
                        <div>
                          <h4>UserID: {account.providerUserId}</h4>
                          {permittedChannels.map((channel) => {
                            <div>{channel}</div>
                          })}
                        </div>
                      )
                    })}
                    <p>Want to add another account? Make sure you are signed into {currentProvider} with the account you want to add to GrowthRamp, choose the services you want to allow here, and then click the login button below</p>
                  </div>
                ) : (
                  <p>You don't have any {currentProvider} accounts linked to your GrowthRamp account yet.</p>
                )}

              </div>
              <div>
                <h3>Permissions to add</h3>
              </div>

              <SocialLogin
                loginPending={this.state.loginPending}
                setPending={this.setPending}
                providers={{[currentProvider]: PROVIDERS[currentProvider]}}
                scopes={this.state.scopes}
              />
            </form>
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
