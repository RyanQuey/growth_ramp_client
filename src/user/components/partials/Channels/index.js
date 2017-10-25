import { Component } from 'react';
import { connect } from 'react-redux'
import {
  CREATE_PLAN_REQUEST,
  CHOOSE_PLAN,
  UPDATE_POST_REQUEST,
  UPDATE_PLAN_REQUEST,
} from 'constants/actionTypes'
import { Navbar, Icon } from 'shared/components/elements'
import { SocialLogin } from 'shared/components/partials'
import { ProviderAccountsDetails, PlanAccountConfiguration } from 'user/components/partials'
import theme from 'theme'

class Channels extends Component {
  constructor(props) {
    super(props)

    let currentProvider, currentAccount
    if (props.providerAccounts && Object.keys(props.providerAccounts).length > 0) {
      currentProvider = Object.keys(props.providerAccounts)[0]
      currentAccount = props.providerAccounts[currentProvider][0]
    } else {
      currentProvider = ""
      currentAccount = null
    }

    this.state = {
      status: 'READY', //other statuses include: 'PENDING'
      mode: 'VIEW', //other modes include: 'EDIT'
      currentProvider,// will just be the provider name
      currentAccount,//will be account obj
    }

    this.handleChooseProvider = this.handleChooseProvider.bind(this)
    this.addAccountToPlan = this.addAccountToPlan.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
    this.handleLinkProvider = this.handleLinkProvider.bind(this)
  }

  componentWillReceiveProps(props) {
    /*if (props.providerAccounts !== this.props.providerAccounts) {

    }*/
  }

  handleChooseProvider(provider) {
    this.setState({
      currentProvider: provider,
      currentAccount: this.props.providerAccounts[provider][0],
    })
  }

  setAccount(account) {
    this.setState({})
  }

  handleLinkAccount(provider) {

  }

  handleLinkProvider() {
    this.props.setCurrentModal("LinkProviderAccountModal")
  }

  addProviderToPlan (){
    //not persisting the provider, only persisting the account
  }

  addAccountToPlan (){
    this.setState({
      status: "PENDING"
    })

    const plan = Object.assign({}, this.props.currentPlan)

    //or have a separate function for adding a provider account?
    this.props.updatePlanRequest({providerAccounts})
  }

  handleChangeMode (mode) {
    this.setState({mode})
  }

  handleChangeName (e, errors) {
    Helpers.handleParam.bind(this, e, "name")()
  }

  handleRemoveProvider(planId, e) {
    e.preventDefault && e.preventDefault()
    //not yet removing the plan ID from that users plan list...
    //Not sure if I'll ever use that users plan list though
    //will probably either use a different action, or rename this one to just update any resource/update any plan
    this.props.setInputValue({
      path: `plans/${planId}`,
      value: null
    })
  }

  render() {
    if (this.props.hide) {
      return null
    }
    let providers = Object.keys(this.props.providerAccounts || {})
    const accountsForProvider = this.props.providerAccounts[this.state.currentProvider]
    //let accountsNotOnPlan = accountsForProvider //when implementing, make array of indices in reverse; remove starting from back to not mess up indicies while removing.



console.log(this.state.currentProvider);
    return (
      <div>
        <h1 className="display-3">Channels</h1>
        {this.state.status === "PENDING" && <Icon name="spinner" className="fa-spin" />}

        <Navbar className="nav navTabs justifyContentStart" background="white" color={theme.color.text}>
          <ul role="tablist">
            {providers.map((provider) => (
              <li key={provider} onClick={this.handleChooseProvider.bind(this, provider)}>
                {this.state.currentProvider === provider ? (
                  <strong>{provider}</strong>
                ) : (
                  <span>{provider}</span>
                )}
              </li>
            ))}
            <li onClick={this.handleLinkProvider}>
              <span>+</span>
            </li>
          </ul>
        </Navbar>

        <div>
          {accountsForProvider.length === 0 ? (
            <h3>No social network accounts configured yet; add one more accounts before continuing</h3>
          ) : (
            <div>
              {accountsForProvider.map((account) => (
                <div key={account.id} onClick={this.setAccount.bind(this, account)}>
                  <img alt="your face" />
                  <h5>{account.email || "no email..."}</h5>
                </div>
              ))}

              {this.state.currentAccount ? (
                <PlanAccountConfiguration account={this.state.currentAccount}/>
              ) : (
                <div>No account yet</div>
              )}
            </div>
          )}

          {this.state.currentProvider === "ADD_AN_ACCOUNT" && (
            <div>
              <h3>Add one of your platforms</h3>
              {accountsNotOnPlan? (
                accountsNotOnPlan.map((provider) => {
                  return <button key={provider} type="button" className="btn-outline-primary btn-lg" onClick={this.handleAddProviderToPlan.bind(this, provider)}>{provider}</button>
                })
              ) : (
                <h3>You have no other social media accounts linked with GrowthRamp. Let's add some more to get started!</h3>
              )}
              <div>
                <h3>Or link a new platform to GrowthRamp</h3>

                <button>Add new platform</button>
              </div>
            </div>

          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    currentPlan: state.currentPlan,
    providerAccounts: state.providerAccounts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updatePostRequest: (payload) => {dispatch({type: UPDATE_POST_REQUEST, payload})},
    updatePlanRequest: (payload) => {dispatch({type: UPDATE_PLAN_REQUEST, payload})},
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload})
  }
}

const ConnectedChannels = connect(mapStateToProps, mapDispatchToProps)(Channels)
export default ConnectedChannels
