import React, { Component } from 'react';
import { connect } from 'react-redux'
import {
  ProviderAccountPicker
} from 'user/components/partials'
import { SET_CURRENT_MODAL } from 'constants/actionTypes'

class ProviderAccounts extends Component {
  constructor() {
    super()
    this.state = {
      //will need to use a store, if this is ever used in subcomponents of the subcomponents
      currentProviderAccount: {},
    }

    this.state = {
      mode: 'CHOOSE_PROVIDER', //you do this or 'ADD_PROVIDER'
    }
    this.clickAddProvider = this.clickAddProvider.bind(this)
  }

  componentDidMount() {

  }

  clickAddProvider() {
    this.props.setCurrentModal("LinkProviderAccountModal")
  }

  render() {
    const c = this;
    const providerAccounts = this.props.providerAccounts
    let providers = []
    const currentProvider = Helpers.safeDataPath(this.props, "match.params.provider", "")
console.log(currentProvider);

    //not sure what I'm doing here...why not just do providers = Object.keys(providerAccounts)?
    Object.keys(providerAccounts).map((provider) => {
      if (!providers.includes(provider)) {
        providers.push(provider)
      }
    })
console.log(providers);
    if (!providers.map((p) => p.toLowerCase()).includes(currentProvider.toLowerCase())) {
      return (
        <div>
          <h1>Provider Accounts</h1>
          <h3>Select a provider in the sidebar to see your accounts</h3>
          <p>At least for now, choose and add providers in the sidebar, you have a clear distinction from when adding accounts to a plan</p>
          <p>details about the selected provider will appear here in the main view</p>
  <hr/>
          <p>However, use the same modal for actually linking a new account</p>

          {Object.keys(providerAccounts).length > 0 ? (
            <div>
            </div>
          ) : (
            <div>
              <h3>There are currently no provider Accounts associated with this account</h3>
              <div>Either create a new one or ask for permission from an associate</div>
            </div>
          )}
          <button type="button" className="btn-outline-primary btn-sm" onClick={this.clickAddProvider}>Add a provider</button>

        </div>
      );

    } else {
//will pass in the currentProvider into the props of some component
      return (
        <div>
          <h1>{currentProvider}</h1>
          <ProviderAccountDetails providerAccount={this.state.providerAccount}/>
          <p>here are some cool details about your {currentProvider} account</p>
        </div>
      )
    }
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
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProviderAccounts)


