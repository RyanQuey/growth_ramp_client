import React, { Component } from 'react';
import firebase from 'firebase';
import { connect } from 'react-redux'
import FirebaseInput from './shared/firebaseInput'
import fbApp from '../firebaseApp';
import ProviderChooser from './providerChooser'
import ConfigurePlanChannels from './configurePlanChannels'
import { SET_INPUT_VALUE  } from '../actions'
import { PROVIDERS, PROVIDER_IDS_MAP } from '../constants'

const database = fbApp.database();


class Channels extends Component {
  constructor() {
    super()

    this.state = {
      currentProvider: false,
    }
    this.chooseProvider = this.chooseProvider.bind(this)
  }

  chooseProvider(provider) {
    this.setState({currentProvider: provider})
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const c = this;
    const userId = this.props.user.uid

    return (
      <div>
        <h1 className="display-3">Channels</h1>
        <ProviderChooser 
          hide={!this.props.currentPlan}  
          chooseProvider={this.chooseProvider}
        />

        <ConfigurePlanChannels 
          hide={!this.state.currentProvider}  
          currentProvider={this.state.currentProvider}
        />
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

const ConnectedChannels = connect(mapStateToProps, mapDispatchToProps)(Channels)
export default ConnectedChannels
