import React, { Component } from 'react';
// here, adds the additional string functions
import helpers from 'helpers'
import 'prototypeHelpers'
import logo from 'images/logo.png';
import { Authenticated, Unauthenticated } from 'components/yields'
//import Layout from 'components/layout';
import { connect } from 'react-redux'
import firebase from 'firebase';
import store from 'reducers'
import { FETCH_POST_REQUEST, FETCH_PLAN_REQUEST, FETCH_USER_REQUEST, UPDATE_TOKEN_REQUEST, IS_PRELOADING_STORE } from 'actions'
import 'App.css';

class App extends Component {

  componentDidMount() {
    axios.get('/api/test')
    .then(res => console.log("got it: ", res))


        /*if (this.props.user) {
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
        }*/

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
            {this.props.user ? (
              <Authenticated />
            ) : (
              <Unauthenticated />
            )}
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
    userFetchRequest: (data) => dispatch({type: FETCH_USER_REQUEST, payload: data}),
    postFetchRequest: (data) => dispatch({type: FETCH_POST_REQUEST, payload: data}),
    planFetchRequest: (data) => dispatch({type: FETCH_PLAN_REQUEST, payload: data}),
    tokenUpdateRequest: (data) => dispatch({type: UPDATE_TOKEN_REQUEST, payload: data}),
    isPreloadingStore: (data) => dispatch({type: IS_PRELOADING_STORE, payload: data}),
  }
}
const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App)
export default ConnectedApp
