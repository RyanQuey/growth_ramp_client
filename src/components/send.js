import React, { Component } from 'react';
import firebase from 'firebase';
import { connect } from 'react-redux'
import FirebaseInput from './shared/firebaseInput'
import fbApp from '../firebaseApp';
import { SET_INPUT_VALUE, POST_PUBLISH_REQUEST } from '../actions'

const database = fbApp.database();


class Send extends Component {
  constructor() {
    super()

    this.state = {}

  }

  render() {
    if (this.props.hide) {
      return null
    }
    const c = this;
    const userId = this.props.user.uid

    return (
      <div id="send-container">
        <h1 className="display-3">Send</h1>
        Now you send it
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
    postPublishRequest: (payload) => dispatch({type: POST_PUBLISH_REQUEST, payload}),
  }
}

const ConnectedSend = connect(mapStateToProps, mapDispatchToProps)(Send)
export default ConnectedSend
