import { Component } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Button, Icon } from 'shared/components/elements'
import { PROVIDERS } from 'constants/providers'
import {
  AccountsForProvider
} from 'user/components/partials'
import { SET_CURRENT_MODAL } from 'constants/actionTypes'

class Providers extends Component {
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
    const providers = Object.keys(providerAccounts)

    //not sure what I'm doing here...why not just do providers = Object.keys(providerAccounts)?
    Object.keys(providerAccounts).map((provider) => {
      if (!providers.includes(provider)) {
        providers.push(provider)
      }
    })
    //just rendering general info
    return (
      <div>
        <h1>Platforms</h1>
        <p>At least for now, choose and add providers in the sidebar, you have a clear distinction from when adding accounts to a plan</p>
        <p>details about the selected provider will appear here in the main view</p>
<hr/>
        <p>However, use the same modal for actually linking a new account</p>
        {providers.length > 0 ? (
          <div>
            <h3>Your Platforms:</h3>
            {providers.map((provider) => (
              <Link key={provider} to={`/providerAccounts/${provider.toLowerCase()}`}>
                <Button style="inverted">
                  {<Icon name={provider.toLowerCase()}  className={classes.icon}/>}
                  {PROVIDERS[provider].name}
                </Button>
              </Link>
            ))}
          </div>
        ) : (
          <div>
            <h3>You currently don't have any platform accounts set up for Growth Ramp</h3>
            <div>Either create a new one or ask for permission from an associate</div>
          </div>
        )}
        <Button type="button" onClick={this.clickAddProvider}>Add a provider</Button>
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
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Providers)



