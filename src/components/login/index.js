import App from '../../firebaseApp';
import { signInRequested } from '../../actions'
import React, { Component } from 'react';
import { connect } from 'react-redux'
import firebase from 'firebase';

class Login extends Component {
  constructor() {
    super()
    this.state = {
      email: ""
    }

    this.handleChange = this.handleChange.bind(this);
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

  render() {
    const c = this;
    return (
      <div id="login">
        <form onSubmit={c.onSubmit}>
          <label> email </label>
          <input onChange={c.handleChange} value={c.state.value}></input>
        </form>
        <button onClick={c.providerLogin.bind(c, "GOOGLE")}> Login with Google</button>
      </div>
    );
  }
}

// getting redux state passed into the state of ConnectedLogin, to be passed into the props of Index
const mapStateToProps = state => {
  return {
    
  }
}

// can be passed in as { signInRequested } into connect as a shortcut, but learning the long way for now until I can get used to it, and know how to modify the dispatches for later on
const mapDispatchToProps = (dispatch) => {
  return {
    signInRequested: (data) => dispatch(signInRequested(data))
  }
}
const ConnectedLogin = connect(mapStateToProps, mapDispatchToProps)(Login)
export default ConnectedLogin
