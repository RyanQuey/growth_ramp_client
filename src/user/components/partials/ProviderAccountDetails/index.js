import { Component } from 'react';
import { connect } from 'react-redux'
import { SET_INPUT_VALUE  } from 'constants/actionTypes'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants'

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

    const providers = this.props.providers
    const accounts = this.props.providerAccounts || {}

    return (
      <div>
        <div>
          <h1>{this.props.currentProvider}</h1>

          {accounts[this.props.currentProvider].map((account) => (
            <div>
              <h3>Username: {account.userName}</h3>
              <p>Will have general summary, permissions per account, buttons to share permissions, and everything that is in the add provider modal</p>
            </div>
          ))}
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

