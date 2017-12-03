import { Component } from 'react';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  UPDATE_CAMPAIGN_REQUEST,
} from 'constants/actionTypes'
import { Input, Button, Card, Flexbox } from 'shared/components/elements'
import { PlanPicker } from 'user/components/partials'
import { formActions, alertActions } from 'shared/actions'

class Start extends Component {
  constructor(props) {
    super(props)

    this.state = {
      //name: props.currentCampaign.name || "",
      //planId: props.currentCampaign.planId,
      //contentUrl: props.currentCampaign.contentUrl || "",
      errors: [],
      pending: false,
      dirty: false,
    }

    this.handleClickPlan = this.handleClickPlan.bind(this)
    this.handleErrors = this.handleErrors.bind(this)
    this.startFromScratch = this.startFromScratch.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
    this.handleUrl = this.handleUrl.bind(this)
    this.saveOrContinue = this.saveOrContinue.bind(this)
  }

  componentDidMount() {
    //so, if back button is pressed in future, won't continually bounce you to "Compose"
    //disabling; keep it simple. They start at the beginning each time

    //if page loads and at published campaign, don't edit it!!
  }

  componentWillReceiveProps(props) {
    //now switching after choosing a plan option
    if (props.currentCampaign && props.currentCampaign.planId && props.initialOpening) {
      this.props.switchTo("Compose")
    }
  }

  startFromScratch() {
    formActions.setParams("EditCampaign", "other", {planId: null})
  }

  handleClickPlan(plan) {
    formActions.setParams("EditCampaign", "other", {planId: plan.id})
  }

  handleUrl (value, e, errors) {
    formActions.setParams("EditCampaign", "other", {contentUrl: value})
  }

  //eventually will have to handle differently, probably wit errors store, if want to validate name too
  handleErrors (errors, inputName) {
    this.setState({errors })
  }

  handleChangeName (value, e, errors) {
    formActions.setParams("EditCampaign", "other", {name: value})
  }

  saveOrContinue(e) {
    e && e.preventDefault()

    let campaignParams = this.props.campaignParams
    if (!campaignParams.name) {

      alertActions.newAlert({
        title: "Failed to save:",
        message: "Name is required",
        level: "DANGER",
      })
      return
    }

    const done = () => {
      this.props.switchTo("Compose")
      formActions.matchCampaignStateToRecord()
    }

    if (this.props.dirty) {
      const options = {} //can't remember why i have this..maybe just that, I coudl use if needed?
      const params = {
        id: this.props.currentCampaign.id,
        name: campaignParams.name,
        userId: this.props.currentCampaign.userId,
        planId: campaignParams.planId,
        contentUrl: campaignParams.contentUrl && campaignParams.contentUrl.toString().trim(),
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
    //only can switch plans if not saved yet OR there are no posts saved yet
    const canSwitchPlans = !currentCampaign.planId && (!currentCampaign.posts || !currentCampaign.posts.length)

    const campaignParams = this.props.campaignParams

    return (
      <form onSubmit={this.saveOrContinue} >
        <h1 className="display-3">Start</h1>
        <Input
          value={campaignParams.name}
          placeholder="Awesome blog post"
          label="Campaign name:"
          validations={["required"]}
          onChange={this.handleChangeName}
        />
        <Input
          value={campaignParams.contentUrl || ""}
          label="What would you like to promote?"
          placeholder="https://www.website.com/awesome-blog-post"
          disabled={currentCampaign.status !== "DRAFT"}
          validations={["url"]}
          onChange={this.handleUrl}
          handleErrors={this.handleErrors}
        />

        {Object.keys(plans).length === 0 ? (
          <div>
            <h4>You don't have any plans yet. We'll just start from scratch</h4>
          </div>
        ) : (
          !canSwitchPlans ? (
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
                selectedId={campaignParams.planId}
                startFromScratch={this.startFromScratch}
                blankPlan={true}
              />
            </div>
          )
        )}
        <Button type="submit" disabled={this.state.errors && this.state.errors.length }>{this.props.dirty && "Save and "}Continue</Button>

      </form>
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
