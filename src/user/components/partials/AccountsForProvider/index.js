import { Component } from 'react';
import { connect } from 'react-redux'
import { Button, Flexbox } from 'shared/components/elements'
import { PROVIDERS } from 'constants'
import { AccountStatus } from 'user/components/partials'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class ProviderAccountsDetails extends Component {
  constructor() {
    super()

  }

  render() {
    if (this.props.hide) {
      return null
    }

    const currentProvider = this.props.currentProvider
    const providers = this.props.providers
    const currentAccounts = this.props.providerAccounts[currentProvider] || []

    return (
      <div>
        <div>
          <h1>{this.props.currentProvider}</h1>

          <Flexbox>
            {currentAccounts.map((account) => (
              <div key={account.providerUserId}>
                <p>Will have general summary, permissions per account, buttons to share permissions, and everything that is in the add provider modal</p>
                  <AccountStatus
                    account={account}
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

const ConnectedProviderAccountsDetails = connect(mapStateToProps, mapDispatchToProps)(ProviderAccountsDetails)
export default ConnectedProviderAccountsDetails

