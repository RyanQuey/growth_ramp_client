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

        {accounts[this.props.currentProvider].map((account) => {
          <h3>{account.userName}</h3>
        })}
      </div>
    );
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

