import App from '../../firebaseApp';
import { signInRequested, signOutRequested } from '../../actions'
import React, { Component } from 'react';
import { connect } from 'react-redux'
import firebase from 'firebase';

class Login extends Component {
  constructor() {
    super()
    const c = this;
    c.state = {
      email: ""
    }
    // TODO: move this into redux
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        c.setState({loggedIn: true})
        // User is signed in.
      } else {
        c.setState({loggedIn: false})
        // No user is signed in.
      }
    });
    this.handleChange = this.handleChange.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  handleChange(e) {
    
    let value = e.target.value
    this.setState({email: value});
  }

  providerLogin(provider) {
    this.props.signInRequested({
      signInType: 'PROVIDER', 
      provider
    })
  }

  handleSignOut(e) {
    e.preventDefault()
    console.log(" logout click");
    this.props.signOutRequested()
  }

  render() {
    const c = this;
console.log(c.state.loggedIn);
    return (
      <div id="login">
        {c.state.loggedIn ? (
          <div>
            <button onClick={c.handleSignOut}>Logout</button>
          </div>
        ) : (
          <div>
            <form onSubmit={c.onSubmit}>
              <label> Login with email </label>
              <input onChange={c.handleChange} value={c.state.value}></input>
            </form>
            <button onClick={c.providerLogin.bind(c, "GOOGLE")}> Login with Google</button>
            <button onClick={c.providerLogin.bind(c, "FACEBOOK")}> Login with Facebook</button>
          </div>
        )}
      </div>
    );
  }
}

// getting redux state passed into the *state* of ConnectedLogin, to be passed into the *props* of index
const mapStateToProps = state => {
  return {
    
  }
}

// can be passed in as { signInRequested } into connect as a shortcut, but learning the long way for now until I can get used to it, and know how to modify the dispatches for later on
const mapDispatchToProps = (dispatch) => {
  return {
    signInRequested: (data) => dispatch(signInRequested(data)),
    signOutRequested: () => {
      console.log("the dispatch call from the props");
      dispatch(signOutRequested())
    }
  }
}
const ConnectedLogin = connect(mapStateToProps, mapDispatchToProps)(Login)
export default ConnectedLogin
