import React, { Component } from 'react';
// here, adds the additional string functions
import helpers from './helpers'
import './prototypeHelpers'
import logo from './logo.svg';
import Layout from './components/layout';
import { connect } from 'react-redux'
import firebase from 'firebase';
import store from './reducers'
import { POST_FETCH_REQUEST, PLAN_FETCH_REQUEST, USER_FETCH_REQUEST, TOKEN_UPDATE_REQUEST, IS_PRELOADING_STORE } from './actions'
import './App.css';

class App extends Component {

  componentDidMount() {
    axios.get('/api/test')
    .then(res => console.log("got it: ", res))

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {

        //need to retrieve user data from firebase, to put into redux
        //mostly only gets ran when reloading the page after already logged in
        if (!this.props.user) {
          const userData = helpers.extractUserData(user)
          this.props.userFetchRequest(userData)
          this.props.postFetchRequest(userData)
          this.props.planFetchRequest(userData)

          let userProviders = []
          userData.providerData && userData.providerData.forEach((provider) => {
            userProviders.push(provider.providerId)
          })
          if (userProviders.length > 0) {
            this.props.tokenUpdateRequest({providerIds: userProviders})
          }
        }

      } else {
        // stop preloading, because no user in firebase to preload
        this.props.isPreloadingStore({preloadingData: false})

      }
    })

  }

  render() {
    return (
      <div className="App">
        {this.props.preloadingStore ? (
          <div>
            <img src={logo} className="App-logo" alt="logo" />
            <div>loading...</div>
          </div>
        ) : (
          <div>
            <Layout />
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

// can be passed in as { signInRequest } into connect as a shortcut, but learning the long way for now until I can get used to it, and know how to modify the dispatches for later on
const mapDispatchToProps = (dispatch) => {
  return {
    userFetchRequest: (data) => dispatch({type: USER_FETCH_REQUEST, payload: data}),
    postFetchRequest: (data) => dispatch({type: POST_FETCH_REQUEST, payload: data}),
    planFetchRequest: (data) => dispatch({type: PLAN_FETCH_REQUEST, payload: data}),
    tokenUpdateRequest: (data) => dispatch({type: TOKEN_UPDATE_REQUEST, payload: data}),
    isPreloadingStore: (data) => dispatch({type: IS_PRELOADING_STORE, payload: data}),
  }
}
const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App)
export default ConnectedApp
