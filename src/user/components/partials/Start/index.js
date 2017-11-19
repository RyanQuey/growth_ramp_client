import { Component } from 'react';
import { connect } from 'react-redux'
import { take } from 'redux-saga/effects'
import {
  UPDATE_CAMPAIGN_REQUEST,
} from 'constants/actionTypes'
import { Input, Button, Card } from 'shared/components/elements'
import { PlanPicker } from 'user/components/partials'

class Start extends Component {
  constructor(props) {
    super(props)

    this.state = {
      name: props.currentCampaign.name || "",
      planId: props.currentCampaign.planId,
      contentUrl: props.currentCampaign.contentUrl || "",
      pending: false,
      dirty: false,
    }

    this.handleClickPlan = this.handleClickPlan.bind(this)
    this.startFromScratch = this.startFromScratch.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
    this.handleUrl = this.handleUrl.bind(this)
    this.save = this.save.bind(this)
  }

  componentDidMount() {
    //so, if back button is pressed in future, won't continually bounce you to "Compose"
    //disabling; keep it simple. They start at the beginning each time

    /*if (this.props.currentCampaign && this.props.currentCampaign.planId && this.props.initialOpening) {
      this.props.switchTo("Compose", true)
    }*/

  }

  componentWillReceiveProps(props) {
    //now switching after choosing a plan option
    if (props.currentPlan && (props.currentPlan !== this.props.currentPlan)) {

    } else if (props.currentCampaign && props.currentCampaign.planId && props.initialOpening) {
      this.props.switchTo("Compose")
    }
  }

  startFromScratch() {
    this.setState({
      planId: undefined,
      dirty: true,
    })
  }

  handleClickPlan(plan) {
    this.setState({
      planId: plan.id,
      dirty: true,
    })
  }

  handleUrl (value, e, errors) {
    this.setState({
      contentUrl: value,
      dirty: true,
    })
  }

  handleChangeName (value, e, errors) {
    this.setState({
      name: value,
      dirty: true,
    })
  }

  save() {
    const done = () => {
      this.setState({dirty: false})
      this.props.switchTo("Compose")
    }
    if (this.state.dirty) {
      const options = {

      }

      this.props.updateCampaignRequest({
        id: this.props.currentCampaign.id,
        planId: this.state.planId,
        name: this.state.name,
        userId: this.props.user.id,
        contentUrl: this.state.contentUrl
      }, options, done)

    } else {
      done()
    }
  }

  render() {
    if (this.props.hide) {
      return null
    }
    const c = this;
    const userId = this.props.user.uid
    const plans = this.props.plans
    const keys = plans && Object.keys(plans)

    return (
      <div>
        <h1 className="display-3">Start</h1>
        <Input
          value={this.state.name}
          placeholder="Awesome blog post"
          label="Campaign name:"
          onChange={this.handleChangeName}
        />
        <Input
          value={this.state.contentUrl}
          label="What would you like to promote?"
          placeholder="www.website.com/awesome-blog-post"
          onChange={this.handleUrl}
        />

        {Object.keys(plans).length === 0 ? (
          <div>
            <h4>You don't have any plans yet. We'll just start from scratch</h4>
          </div>
        ) : (
          <div>
            <h4>
              Select one of your plans to use or start from scratch.
            </h4>
            <PlanPicker
              onPick={this.handleClickPlan}
              selectedId={this.state.planId}
            />
            <Card
              onClick={this.startFromScratch}
              selected={!this.state.planId}
              height="100px"
            >
              <h3>
                Start from scratch
              </h3>
            </Card>
          </div>
        )}
        <Button onClick={this.save}>{this.state.dirty && "Save and "}Continue</Button>

      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    campaigns: state.campaigns,
    plans: state.plans,
    currentPlan: state.currentPlan,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    createPlanRequest: (payload) => dispatch({type: CREATE_PLAN_REQUEST, payload}),
    updateCampaignRequest: (payload, options, cb) => dispatch({type: UPDATE_CAMPAIGN_REQUEST, payload, options, cb}),
  }
}

const ConnectedStart = connect(mapStateToProps, mapDispatchToProps)(Start)
export default ConnectedStart
