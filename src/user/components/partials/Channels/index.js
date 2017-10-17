import { Component } from 'react';
import { connect } from 'react-redux'
import { take } from 'redux-saga/effects'
import {
  CREATE_PLAN_SUCCESS,
  CREATE_PLAN_REQUEST,
  CHOOSE_PLAN,
} from 'constants/actionTypes'
import { Navbar } from 'shared/components/elements'
import { ProviderAccountsDetails } from 'user/components/partials'
import theme from 'theme'

class Channels extends Component {
  constructor(props) {
    super(props)

    let currentProvider
    if (props.providerAccounts && Object.keys(props.providerAccounts).length > 0) {
      currentProvider = Object.keys(props.providerAccounts)[0]
    } else {
      currentProvider = null
    }

    this.state = {
      status: 'READY', //other statuses include: 'PENDING'
      mode: 'VIEW', //other modes include: 'EDIT'
      currentProvider,
    }

    this.handleChooseProvider = this.handleChooseProvider.bind(this)
    this.handleAddProviderToPlan = this.handleAddProviderToPlan.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
  }

  componentWillReceiveProps(props) {
    /*if (props.providerAccounts !== this.props.providerAccounts) {

    }*/
  }

  handleChooseProvider(provider) {
    this.setState({currentProvider: provider})
  }

  handleAddProviderToPlan (){
    this.setState({
      currentProvider: 'ADD_AN_ACCOUNT'
    })
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
    const c = this;
    const providerAccounts = this.props.providerAccounts || {}
    //TODO: make a separate reducer that response to some of the actions that providerAccounts does, but only to users providers?
    //avoids having to run this on every render, when it doesn't really change that often
    let userProviders = []
    Object.keys(providerAccounts).map((provider) => {
      if (!userProviders.includes(provider)) {
        userProviders.push(provider)
      }
    })

    let planProviders = Object.keys(this.props.currentPlan.channelConfigurations || {})
    let userProvidersNotOnPlan = userProviders.filter((userProvider) => {
      return !planProviders.includes(userProvider)
    })


console.log(this.state.currentProvider);
    return (
      <div>
        <h1 className="display-3">Channels</h1>
        <Navbar className="nav navTabs justifyContentCenter" background="white" color={theme.color.text}>
          <ul role="tablist">
            {planProviders.map((provider) => (
              <li key={provider} onClick={this.handleChooseProvider}>
                {this.state.currentProvider === provider ? (
                  <strong>{provider}</strong>
                ) : (
                  <span>{provider}</span>
                )}
              </li>
            ))}
            <li onClick={this.handleAddProviderToPlan}>
              <span>+</span>
            </li>
          </ul>
        </Navbar>

        <div>
          {providerAccounts.length === 0 ? (
            <h3>No social network accounts configured yet; add one more accounts before continuing</h3>
          ) : (
            <div>
            </div>
          )}

          {this.state.currentProvider === "ADD_AN_ACCOUNT" && (
            <div>
              <h3>Add one of your accounts</h3>
              {userProvidersNotOnPlan? (
                userProvidersNotOnPlan.map((provider) => {
                  return <button key={provider} type="button" className="btn-outline-primary btn-lg" onClick={this.handleAddProviderToPlan.bind(this, provider)}>{provider}</button>
                })
              ) : (
                <h3>You have no other social media accounts linked with GrowthRamp. Let's add some more to get started!</h3>
              )}
              <div>
                <h3>Or link and you account to GrowthRamp</h3>
                <SocialLogin />
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
  }
}

const ConnectedChannels = connect(mapStateToProps, mapDispatchToProps)(Channels)
export default ConnectedChannels
