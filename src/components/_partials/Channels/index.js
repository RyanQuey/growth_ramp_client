import React, { Component } from 'react';
import firebase from 'firebase';
import { connect } from 'react-redux'
import FirebaseInput from './shared/firebaseInput'
import fbApp from '../firebaseApp';
import { SET_INPUT_VALUE } from 'constants/actionTypes'

const database = fbApp.database();


class Compose extends Component {
  constructor() {
    super()

    this.state = {}

    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit(e) {
    e.preventDefault()
    //alert(" Eventually will send to Facebook etc.")
    //make sure user cannot submit before login... Or I have to use the watcher that firebase provides
    let user = this.props.user;
    let payload = { 
      //post: this.props.post, 
      //hard coding for now
      providers: ["facebook", "twitter"],
      //appsecret_proof: this.props.user.facebookAppSecretProof ,
    }

    if (user) {
      this.props.postPublishRequest(payload)
    } else {
      alert(" Please sign in 1st")
    }
  }

  render() {
    if (this.props.hide) {
      return null
    }
    const c = this;
    const postId = this.props.post//.id
    const userId = this.props.user.uid

    if (!this.props.post) {
      return (<div></div>)
    }
    return (
      <div>
          <h1 className="display-3">Compose</h1>
          <div className="status-container">
            {this.state.status === "error" && (
              <span>Error: {this.state.error.message}</span>
            )}
            {this.state.status === "pending" && (
              <span>Saving...</span>
            )}
            {this.state.status === "success" && (
              <span>post saved</span>
            )}
          </div>
          <form onSubmit={c.onSubmit}>
            <div>
              <label> Your post </label>
              <FirebaseInput 
                type="textarea"
                value={this.props.post.content} 
                keys={`posts.${postId}.content`}
              />
            </div>
            <button type="submit">Promote your stuff</button>
          </form>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    tokenInfo: state.tokenInfo,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setInputValue: (payload) => dispatch({type: SET_INPUT_VALUE, payload}),
  }
}


const ConnectedCompose = connect(mapStateToProps, mapDispatchToProps)(Compose)
export default ConnectedCompose
