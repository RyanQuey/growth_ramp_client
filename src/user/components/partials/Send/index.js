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
    this.finished = this.finished.bind(this)
  }

  //TODO might just put in EditCampaign, DRY things up
  componentWillReceiveProps(props) {
    //happens when create new campaign from navbar
    //only trigger if there is currently a campaign already set
    if (this.props.currentCampaign.id && props.currentCampaign.id !== this.props.currentCampaign.id) {
      this.props.switchTo("Start", true)
    }
    /*if (props.providerAccounts !== this.props.providerAccounts) {

    }*/
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

  finished() {
    this.props.history.push("/campaigns")
  }

  render() {
    if (this.props.hide) {
      return null
    }
    const c = this;
    const userId = this.props.user.uid
    const mode = this.state.mode

    if (this.state.mode === "savePlan") {

    }

    return (
      <div id="send-container">
        <h1 className="display-3">{mode === "savePlan" ? "Save" : "Send"}</h1>
        {mode === "savePlan" ? (
          <div>
            <h3>Do you want to use this campaign as a template for future campaigns?</h3>
            <SavePlanFromCampaign
              finished={this.finished}
            />
          </div>
        ) : (
          <div>
            Now you send it
            <Button pending={this.state.pending} disabled={this.state.pending} onClick={this.send}>Send Posts</Button>
          </div>
        )}
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
