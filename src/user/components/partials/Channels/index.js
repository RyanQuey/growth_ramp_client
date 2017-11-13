import { Component } from 'react';
import { connect } from 'react-redux'
import {
  CREATE_PLAN_REQUEST,
  CHOOSE_PLAN,
  UPDATE_POST_REQUEST,
  UPDATE_PLAN_REQUEST,
  LIVE_UPDATE_PLAN_SUCCESS,
  LIVE_UPDATE_PLAN_FAILURE,
  SET_CURRENT_MODAL,
} from 'constants/actionTypes'
import { Navbar, Icon, Button } from 'shared/components/elements'
import { SocialLogin } from 'shared/components/partials'
import { ProviderAccountsDetails, PlanAccountConfiguration } from 'user/components/partials'
import {PROVIDERS} from 'constants/providers'
import theme from 'theme'

class Channels extends Component {
  constructor(props) {
    super(props)

    let currentProvider = "FACEBOOK"
    let currentAccount
    if (props.providerAccounts && Object.keys(props.providerAccounts).length > 0) {
      currentAccount = props.providerAccounts[currentProvider][0]
    } else {
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
    this.openNewProviderModal = this.openNewProviderModal.bind(this)
  }

  componentWillReceiveProps(props) {
    //happens when create new post from navbar
    if (this.props.currentPost && !this.props.currentPost.planId) {
      this.props.switchTo("Start", true)
    }
    /*if (props.providerAccounts !== this.props.providerAccounts) {

    }*/
  }

  openNewProviderModal(provider) {
    //provider will be the only provider they add an account for
    this.props.setCurrentModal("LinkProviderAccountModal", {provider})
  }

  handleChooseProvider(provider) {
console.log(provider);
    this.setState({
      currentProvider: provider,
      currentAccount: Helpers.safeDataPath(this.props, `providerAccounts.${provider}.0`, false),
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
    let providers = Object.keys(PROVIDERS)
    const accountsForProvider = this.props.providerAccounts[this.state.currentProvider] || []
    //let accountsNotOnPlan = accountsForProvider //when implementing, make array of indices in reverse; remove starting from back to not mess up indicies while removing.

    return (
      <div>
        <h1 className="display-3">Channels</h1>
        {this.state.status === "PENDING" && <Icon name="spinner" className="fa-spin" />}

        <Navbar tabs={true} justifyTabs="flex-start" background="white" color={theme.color.text}>
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
          </ul>
        </Navbar>

        <div>
          {accountsForProvider.length === 0 ? (
            <h3>No social network accounts configured yet; add one more accounts before continuing</h3>
          ) : (
            <div>
              {accountsForProvider.map((account) => (
                <div key={account.id} onClick={this.setAccount.bind(this, account)}>
                  <img alt="No profile picture on file" src={account.photoUrl}/>
                  <h5>{account.email || "No email on file"}</h5>
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
                  return <Button key={provider} type="button" className="btn-outline-primary btn-lg" onClick={this.handleAddProviderToPlan.bind(this, provider)}>{provider}</Button>
                })
              ) : (
                <h3>You have no other social media accounts linked with GrowthRamp. Let's add some more to get started!</h3>
              )}
              <div>
                <h3>Or link a new platform to GrowthRamp</h3>

              </div>
            </div>

          )}
          <Button onClick={this.openNewProviderModal.bind(this, this.state.currentProvider)}>Add new {this.state.currentProvider} account</Button>
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
    setCurrentModal: (payload, modalOptions) => dispatch({type: SET_CURRENT_MODAL, payload, options: modalOptions})
  }
}

const ConnectedChannels = connect(mapStateToProps, mapDispatchToProps)(Channels)
export default ConnectedChannels
