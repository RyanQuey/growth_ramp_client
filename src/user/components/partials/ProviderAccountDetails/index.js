import { Component } from 'react';
import { connect } from 'react-redux'
import { SET_INPUT_VALUE  } from 'constants/actionTypes'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class ProviderAccountsDetails extends Component {
  constructor() {
    super()

    this.state = {
      mode: 'CHOOSE_PROVIDER', //you do this or 'ADD_PROVIDER'
    }
    this.chooseProvider = this.chooseProvider.bind(this)
    this.addProvider = this.addProvider.bind(this)
    this.clickAddProvider = this.clickAddProvider.bind(this)
  }

  chooseProvider(provider) {
    this.props.chooseProvider(provider)
  }

  addProvider() {
    //either you will add providers you have disabled for this plan, or login to totally new providers
    //while there are only three providers, can show all of them...or get users used to the future UI by only showing already added providers?

    //check if you already have this token

    //then add to plan
    this.setState({mode: 'CHOOSE_PROVIDER'})
  }

  clickAddProvider() {
    this.setState({mode: 'ADD_PROVIDER'})
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const providers = this.props.providers
    const accounts = this.props.providerAccounts || {}
    return (
      <div>
        <h3>Select a provider in the sidebar to see your accounts</h3>
        <p>, at least for now, choose and add providers in the sidebar, you have a clear distinction from when adding accounts to a plan</p>
        {false && <button type="button" className="btn-outline-primary btn-sm" onClick={this.clickAddProvider}>Add a provider</button>}

        {this.state.mode === 'ADD_PROVIDER' && (
          <div> <h3>Select a platform to add</h3>
            {Object.keys(PROVIDERS).map((provider) => {
              return (
                <button type="button" className="btn-info btn-sm" onClick={this.addProvider}>{provider.titleCase()}</button>
              )
            })}
          </div>
        )}


              {accounts[this.state.currentProvider].map((account) => {
                <h3>{account.userName}</h3>

              })}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    tokenInfo: state.tokenInfo,
    currentPlan: state.currentPlan,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setInputValue: (payload) => dispatch({type: SET_INPUT_VALUE, payload}),
  }
}

const ConnectedProviderAccountsDetails = connect(mapStateToProps, mapDispatchToProps)(ProviderAccountsDetails)
export default ConnectedProviderAccountsDetails
