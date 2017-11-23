import { Component } from 'react';
import { connect } from 'react-redux'
import { SET_INPUT_VALUE, PUBLISH_CAMPAIGN_REQUEST } from 'constants/actionTypes'
import { SavePlan } from 'user/components/partials'
import { Icon, Button } from 'shared/components/elements'

class Send extends Component {
  constructor() {
    super()

    this.state = {
      mode: "send"
    }

    this.send = this.send.bind(this)
  }

  send() {
    this.props.campaignPublishRequest(this.props.currentCampaign)
  }

  render() {
    if (this.props.hide) {
      return null
    }
    const c = this;
    const userId = this.props.user.uid

    if (this.state.mode === "savePlan") {
      return <SavePlan />
    }

    return (
      <div id="send-container">
        <h1 className="display-3">Send</h1>
        Now you send it
        <div>
          <Button onClick={this.send}>SEND THEM ALL!</Button>
        </div>
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
    campaignPublishRequest: (payload) => dispatch({type: PUBLISH_CAMPAIGN_REQUEST, payload}),
  }
}

const ConnectedSend = connect(mapStateToProps, mapDispatchToProps)(Send)
export default ConnectedSend
