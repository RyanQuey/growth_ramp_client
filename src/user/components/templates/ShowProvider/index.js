import { Component } from 'react';
import { connect } from 'react-redux'
import { Button, Flexbox } from 'shared/components/elements'
import { PROVIDERS } from 'constants/providers'
import { AccountCard } from 'user/components/partials'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class ShowProvider extends Component {
  constructor() {
    super()

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
          <h1>{PROVIDERS[currentProvider].name}</h1>

          <Flexbox>
            {currentAccounts.map((account) => (
              <div key={account.providerUserId}>
                <p>Will have general summary, permissions per account, buttons to share permissions, and everything that is in the add provider modal</p>
                  <AccountCard
                    account={account}
                    showPermissions={true}
                  />
              </div>
            ))}
          </Flexbox>
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
  }
}

const ConnectedShowProvider = connect(mapStateToProps, mapDispatchToProps)(ShowProvider)
export default ConnectedShowProvider

