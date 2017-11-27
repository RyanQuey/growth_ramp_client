import { Component } from 'react';
import { connect } from 'react-redux'
import { SET_INPUT_VALUE, PUBLISH_CAMPAIGN_REQUEST } from 'constants/actionTypes'
import { SavePlanFromCampaign } from 'user/components/partials'
import { withRouter } from 'react-router-dom'
import { Icon, Button } from 'shared/components/elements'

class Send extends Component {
  constructor() {
    super()

    this.state = {
      mode: "send",
      pending: false,
    }

    this.send = this.send.bind(this)
  }

  send() {
    this.setState({pending: true})
    const cb = () => {
      this.setState({
        pending: false,
        mode: "savePlan",
      })
    }

    this.props.campaignPublishRequest(this.props.currentCampaign, cb)
  }

  render() {
    if (this.props.hide) {
      return null
    }
    const c = this;
    const userId = this.props.user.uid

    if (this.state.mode === "savePlan") {
      return <SavePlanFromCampaign />

    }

    return (
      <div id="send-container">
        <h1 className="display-3">Send</h1>
        Now you send it
        <div>
          <Button pending={this.state.pending} disabled={this.state.pending} onClick={this.send}>SEND THEM ALL!</Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    tokenInfo: state.tokenInfo,
    currentCampaign: state.currentCampaign,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    campaignPublishRequest: (payload, cb) => dispatch({type: PUBLISH_CAMPAIGN_REQUEST, payload, cb}),
  }
}

const ConnectedSend = withRouter(connect(mapStateToProps, mapDispatchToProps)(Send))
export default ConnectedSend
