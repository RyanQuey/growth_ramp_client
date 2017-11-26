import { Component } from 'react';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { take } from 'redux-saga/effects'
import {
  UPDATE_CAMPAIGN_REQUEST,
} from 'constants/actionTypes'
import { Input, Button, Card } from 'shared/components/elements'
import { PlanPicker } from 'user/components/partials'
import { formActions } from 'shared/actions'

class Start extends Component {
  constructor(props) {
    super(props)

    this.state = {
      //name: props.currentCampaign.name || "",
      //planId: props.currentCampaign.planId,
      //contentUrl: props.currentCampaign.contentUrl || "",
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

    //if page loads and at published campaign, don't edit it!!
    if (this.props.currentCampaign && this.props.currentCampaign.status === "PUBLISHED") {
      //is already published, don't let them try to edit from using browser link.
      //will disable link to edit elsewhere if published too
      this.props.history.push("/campaigns")
    }
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
    })
  }

//TODO get onto the form store
  handleClickPlan(plan) {
    this.setState({
      planId: plan.id,
    })
  }

  handleUrl (value, e, errors) {
    formActions.setParams("EditCampaign", "other", {contentUrl: value})
  }

  handleChangeName (value, e, errors) {
    formActions.setParams("EditCampaign", "other", {name: value})
  }

  save() {
    const done = () => {
      this.props.switchTo("Compose")
      formActions.formPersisted("EditCampaign", "other")
    }

    if (this.props.dirty) {
      let campaignParams = this.props.campaignParams
      const options = {} //can't remember why i have this..maybe just that, I coudl use if needed?
      const params = {
        id: this.props.currentCampaign.id,
        name: campaignParams.name,
        userId: this.props.currentCampaign.userId,
        contentUrl: campaignParams.contentUrl,
      }

      if (this.state.planId) {
        params.planId = this.state.planId
      }

      this.props.updateCampaignRequest(params, options, done)

    } else {
      this.props.switchTo("Compose")
      done()
    }
  }

  render() {
    if (this.props.hide) {
      return null
    }
    const c = this;
    const { user, plans, currentCampaign }  = this.props
    const userId = user.id

//TODO get this on the form store too
    const keys = plans && Object.keys(plans)
    const campaignPlan = currentCampaign && plans[currentCampaign.planId] || {}
    const canSwitchPlans = !currentCampaign.planId || !_.isEqual(currentCampaign.posts, campaignPlan.postConfigurations)

    const campaignParams = this.props.campaignParams

    return (
      <div>
        <h1 className="display-3">Start</h1>
        <Input
          value={campaignParams.name}
          placeholder="Awesome blog post"
          label="Campaign name:"
          onChange={this.handleChangeName}
        />
        <Input
          value={campaignParams.contentUrl || ""}
          label="What would you like to promote?"
          placeholder="www.website.com/awesome-blog-post"
          onChange={this.handleUrl}
        />

        {Object.keys(plans).length === 0 ? (
          <div>
            <h4>You don't have any plans yet. We'll just start from scratch</h4>
          </div>
        ) : (
          canSwitchPlans ? (
            <div>
              <h4>Campaign plan:</h4>
              <div>{campaignPlan.name}</div>
              <div>Cannot change plan after posts have been worked on</div>
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
          )
        )}
        <Button onClick={this.save}>{this.props.dirty && "Save and "}Continue</Button>

      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    currentCampaign: state.currentCampaign,
    campaigns: state.campaigns,
    campaignParams: Helpers.safeDataPath(state.forms, "EditCampaign.other.params", {}),
    dirty: Helpers.safeDataPath(state.forms, "EditCampaign.other.dirty", false),
    plans: state.plans,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    createPlanRequest: (payload) => dispatch({type: CREATE_PLAN_REQUEST, payload}),
    updateCampaignRequest: (payload, options, cb) => dispatch({type: UPDATE_CAMPAIGN_REQUEST, payload, options, cb}),
  }
}

const ConnectedStart = withRouter(connect(mapStateToProps, mapDispatchToProps)(Start))
export default ConnectedStart
