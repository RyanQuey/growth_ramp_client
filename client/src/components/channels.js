import React, { Component } from 'react';
import firebase from 'firebase';
import { connect } from 'react-redux'
import FirebaseInput from './shared/firebaseInput'
import fbApp from '../firebaseApp';
import { SET_INPUT_VALUE  } from '../actions'

const database = fbApp.database();


class Channels extends Component {
  constructor() {
    super()

    this.state = {}

  }

  render() {
    const c = this;
    const userId = this.props.user.uid

    return (
      <div id="post-draft">
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

const ConnectedChannels = connect(mapStateToProps, mapDispatchToProps)(Channels)
export default ConnectedChannels
