import { Component } from 'react';
import { connect } from 'react-redux'
import { Button, Flexbox } from 'shared/components/elements'
import { AccountCard } from 'user/components/partials'
import { PROVIDERS } from 'constants/providers'
import {
  SET_CURRENT_MODAL,
} from 'constants/actionTypes'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class ShowProvider extends Component {
  constructor() {
    super()

    this.openProviderModal = this.openProviderModal.bind(this)
  }

  openProviderModal() {
    //prompt to give permission
    //will eventually use a store to tell modal to only show this account

    const currentProvider = Helpers.safeDataPath(this.props, "match.params.provider", "").toUpperCase()
    this.props.setCurrentModal("LinkProviderAccountModal", {provider: currentProvider})
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const currentProvider = Helpers.safeDataPath(this.props, "match.params.provider", "").toUpperCase()
    const providers = this.props.providers
    const currentAccounts = this.props.providerAccounts[currentProvider] || []

    return (
      <div>
        <div>
          <h1>{PROVIDERS[currentProvider].name} Accounts</h1>

          <Flexbox>
            {currentAccounts.map((account) => (
              <AccountCard
                key={account.providerUserId}
                account={account}
                detailsButton={true}
              />
            ))}
          </Flexbox>
          <Button style="inverted" onClick={this.openProviderModal}>Add New Account or Add Permissions</Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    providerAccounts: state.providerAccounts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload, modalOptions) => dispatch({type: SET_CURRENT_MODAL, payload, options: modalOptions}),
  }
}

const ConnectedShowProvider = connect(mapStateToProps, mapDispatchToProps)(ShowProvider)
export default ConnectedShowProvider

