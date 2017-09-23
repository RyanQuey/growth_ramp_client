import React, { Component } from 'react';
import firebase from 'firebase';
import { connect } from 'react-redux'
import FirebaseInput from './shared/firebaseInput'
import fbApp from '../firebaseApp';
import { SET_INPUT_VALUE  } from '../actions'
import { PROVIDERS, PROVIDER_IDS_MAP } from '../constants'

const database = fbApp.database();

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class ProviderChooser extends Component {
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

    const providers = this.props.currentPlan.providers

    return (
      <div>
        {providers ? (
          providers.map((provider) => {
            return <button type="button" className="btn-outline-primary btn-lg" onClick={this.chooseProvider.bind(this, provider)}>{provider}</button>
          })
        ) : (
          <h3>You have no providers yet, add some providers to this plan to get started</h3>
        )}
        <button type="button" className="btn-outline-primary btn-sm" onClick={this.clickAddProvider}>Add a provider</button>
        {this.state.mode === 'ADD_PROVIDER' && (
          <div> <h3>Select a platform to add</h3>
            {Object.keys(PROVIDERS).map((provider) => {
              return (
                <button type="button" className="btn-info btn-sm" onClick={this.addProvider}>{provider.titleCase()}</button>
              )
            })}
          </div>
        )}
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

const ConnectedProviderChooser = connect(mapStateToProps, mapDispatchToProps)(ProviderChooser)
export default ConnectedProviderChooser

