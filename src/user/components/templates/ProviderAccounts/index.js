import React, { Component } from 'react';
import { connect } from 'react-redux'
import {
  ProviderAccountPicker
} from 'user/components/partials'
import { LINK_ACCOUNT_REQUEST } from 'constants/actionTypes'

class ProviderAccounts extends Component {
  constructor() {
    super()
    this.state = {
      //will need to use a store, if this is ever used in subcomponents of the subcomponents
      currentProviderAccount: {},
    }

    this.handleChooseProviderAccount = this.handleChooseProviderAccount.bind(this)
  }

  componentDidMount() {

  }

  handleChooseProviderAccount(providerAccount) {
    this.setState({
      providerAccount,
    })
    //TODO: want to use refs
    //might be able to use bind and the contentIndex ?
    //$(ref)[0].firstElementChild.click();
  }

  render() {
    const c = this;
    let tabIndex = 0, contentIndex = 0
    const providerAccounts = this.props.providerAccounts
    let providers = []

    Object.keys(providerAccounts).map((provider) => {
      if (!providers.includes(provider)) {
        providers.push(provider)
      }
    })
console.log(providerAccounts);
    return (
      <div>
        <h1>Provider Accounts</h1>
        <h3>Select a provider in the sidebar to see your accounts</h3>
        <p>At least for now, choose and add providers in the sidebar, you have a clear distinction from when adding accounts to a plan</p>
        <p>However, use the same modal for actually linking a new account</p>

        {Object.keys(providerAccounts).length > 0 ? (
          <div>
            {/* <ProviderAccountDetails providerAccount={this.state.providerAccount}/>*/}
          </div>
        ) : (
          <div>
            <h3>There are currently no providerAccounts associated with this account</h3>
            <div>Either create a new one or ask for permission from an associate</div>
          </div>
        )}
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
    createProviderAccountRequest: (data) => dispatch({type: LINK_ACCOUNT_REQUEST, payload: data}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProviderAccounts)


