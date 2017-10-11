import { Component } from 'react';
import { connect } from 'react-redux'
import { SET_INPUT_VALUE, PUBLISH_POST_REQUEST } from 'constants/actionTypes'

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
    postPublishRequest: (payload) => dispatch({type: PUBLISH_POST_REQUEST, payload}),
  }
}

const ConnectedSend = connect(mapStateToProps, mapDispatchToProps)(Send)
export default ConnectedSend
