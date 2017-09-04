import React, { Component } from 'react';
// here, adds the additional string functions
import helpers from './helpers'
import './prototypeHelpers'
import logo from './logo.svg';
import ShareButton from './components/shareButton';
import Login from './components/login';
import { connect } from 'react-redux'
import firebase from 'firebase';
import store from './reducers'
import { draftsFetchRequested, userFetchRequested, tokensUpdateRequested, isPreloadingStore } from './actions'
import './App.css';

class App extends Component {

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
    
        //need to retrieve user data from firebase, to put into redux
        //mostly only gets ran when reloading the page after already logged in
        if (!this.props.user) {
          const userData = helpers.extractUserData(user)
          this.props.userFetchRequested(userData)
          this.props.draftsFetchRequested(userData)

          let userProviders = []
          userData.providerData && userData.providerData.forEach((provider) => {
            userProviders.push(provider.providerId)
          })
          if (userProviders.length > 0) {
            this.props.tokensUpdateRequested({providerIds: userProviders})
          }
        }
    
      } else {
        // stop preloading, because no user in firebase to preload
        store.dispatch(isPreloadingStore(false))

      }
    })
    
  }
  
  render() {
    return (
      <div className="App">
        {this.props.preloadingStore ? (
          <div>loading...</div>
        ) : (
          <div>
            <div className="App-header">
              <Login />
              <img src={logo} className="App-logo" alt="logo" />
              <h2>Welcome</h2>
            </div>
            <ShareButton />
          </div>  
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    preloadingStore: state.preloadingStore,
    user: state.user,
  }
}

// can be passed in as { signInRequested } into connect as a shortcut, but learning the long way for now until I can get used to it, and know how to modify the dispatches for later on
const mapDispatchToProps = (dispatch) => {
  return {
    userFetchRequested: (data) => dispatch(userFetchRequested(data)),
    draftsFetchRequested: (data) => dispatch(draftsFetchRequested(data)),
    tokensUpdateRequested: (data) => dispatch(tokensUpdateRequested(data)),
  }
}
const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App)
export default ConnectedApp
