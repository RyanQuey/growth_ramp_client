import { Component } from 'react';
import { connect } from 'react-redux'
import {
  SIGN_IN_REQUEST,
  SIGN_OUT_REQUEST,
  LINK_ACCOUNT_REQUEST,
} from 'actions'
import { PROVIDERS, PROVIDER_IDS_MAP } from '../constants'

class Login extends Component {
  constructor() {
    super()
    const c = this;
    c.state = {
      email: ""
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  componentDidMount() {

  }

  handleChange(e) {

    let value = e.target.value
    this.setState({email: value});
  }

  //need to enable with e-mail
  providerLogin(providerName) {
    /*const c = this;
    const user = helpers.safeDataPath(c.props, `user`, false)
    const userProviders = user && c.props.user.providerData || []
    let alreadyLinked = false
    if (userProviders.some((p) => {
      console.log(p, PROVIDER_IDS_MAP[p.providerId])
      return PROVIDER_IDS_MAP[p.providerId] === providerName.toLowerCase()
    })) {
      alreadyLinked = true
    }
    const data = {
      signInType: 'PROVIDER',
      provider: providerName,
    }
    //if already logged in but not yet linked
    if (user && !alreadyLinked) {
      return this.props.linkAccountRequest(data)

    } else if (user) {
      data.wantTokenOnly = true
    }

    return this.props.signInRequest(data)*/
  }

  handleSignOut(e) {
    e.preventDefault()
    console.log(" logout click");
    this.props.signOutRequest()
  }

  render() {
    const c = this;
    const user = this.props.user;
    const preposition = user ? "to" : "with";
    return (
      <div id="login">
        {user ? (
          <div>
            Welcome {user.displayName}!&nbsp;
            <button onClick={c.handleSignOut}>Logout</button>
          </div>
        ) : (
          <form onSubmit={c.onSubmit}>
            <label> Login with email </label>
            <input onChange={c.handleChange} value={c.state.value}></input>
          </form>
        )}
        {Object.keys(PROVIDERS).map((key) => {
          const providerName = PROVIDERS[key].name
          //this works, but temporarily disabling this because neatest button available in case the token expires
          //
            return <a href={`/login/${providerName}`} key={key} onClick={c.providerLogin.bind(c, providerName)}>{`Login ${preposition} ${providerName}`}</a>
          //}
        })}
        {!this.props.user && <a href={`/login/local`} >{`Login with username and password`}</a>}
      </div>
    );
  }
}

// getting redux state passed into the *state* of ConnectedLogin, to be passed into the *props* of index
const mapStateToProps = state => {
  return {
    user: state.user
  }
}

// can be passed in as { signInRequest } into connect as a shortcut, but learning the long way for now until I can get used to it, and know how to modify the dispatches for later on
const mapDispatchToProps = (dispatch) => {
  return {
    signInRequest: (payload) => dispatch({type: SIGN_IN_REQUEST, payload}),
    linkAccountRequest: (payload) => dispatch({type: LINK_ACCOUNT_REQUEST, payload}),
    signOutRequest: (payload) => {dispatch({type: SIGN_OUT_REQUEST, payload})}
  }
}
const ConnectedLogin = connect(mapStateToProps, mapDispatchToProps)(Login)
export default ConnectedLogin
