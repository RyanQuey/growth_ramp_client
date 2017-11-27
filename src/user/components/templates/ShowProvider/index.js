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

