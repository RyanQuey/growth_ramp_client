import { Component } from 'react';
import { connect } from 'react-redux'
import {
  CREATE_PLAN_REQUEST,
  UPDATE_PLAN_REQUEST,
  SET_CURRENT_PLAN,
} from 'constants/actionTypes'
import { Icon, Button, Input } from 'shared/components/elements'

class SavePlanFromCampaign extends Component {
  constructor() {
    super()

    this.state = {
      mode: 'CHOOSE_MODE', //other modes include: 'USE_EXISTING_PLAN', 'CREATE_NEW_PLAN', 'CHOOSE_NAME'
      pending: false,
    }

    this.goBack = this.goBack.bind(this)
    this.handleChoose = this.handleChoose.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
    this.createPlan = this.createPlan.bind(this)
    this.updatePlan = this.updatePlan.bind(this)
  }

  handleChoose(option, e) {
    switch(option) {
      case "UPDATE_CURRENT_PLAN":
        this.setState({mode: option})

        break
      case "CREATE_NEW_PLAN":
        this.setState({
          mode: option
        })

        break

    }
  }

  handleChangeName (value) {
    this.setState({name: value})
  }

  goBack (){
    this.setState({
      mode: "CHOOSE_MODE"
    })
  }

  createPlan (e) {
    e.preventDefault()
    this.setState({pending: true});

    const payload = {
      userId: this.props.user.id,
      name: this.state.name,
      associatedCampaign: this.props.currentCampaign,
    }
    const cb = () => {
      this.setState({pending: false})
    }

    //will have to set the some other way, in case someone else makes one that's later than them or something, and firebase updates it
    this.props.createPlanRequest(payload, cb)
  }

  updatePlan (e) {
    e.preventDefault()
    this.setState({pending: true});

    const payload = {
      id: this.props.currentCampaign.planId,
      userId: this.props.user.id,
      associatedCampaign: this.props.currentCampaign,
    }
    const cb = () => {
      this.setState({pending: false})
    }

    //will have to set the some other way, in case someone else makes one that's later than them or something, and firebase updates it
    this.props.updatePlanRequest(payload, cb)
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const userId = this.props.user.uid
    const campaign = this.props.currentCampaign

    return (
      <div id="send-container">
        <h1 className="display-3">Save?</h1>
        <h3>Save your planned for later?</h3>

        {this.state.mode === "CHOOSE_MODE" && (
          <div>
            {campaign.planId &&
              <Button
                onClick={this.handleChoose.bind(this, "UPDATE_CURRENT_PLAN")}
              >
                Save over current plan
              </Button>
            }

            <Button
              onClick={this.handleChoose.bind(this, "CREATE_NEW_PLAN")}
            >
              Save as new plan
            </Button>
          </div>
        )}

        {this.state.mode === "CREATE_NEW_PLAN" && (
          <form onSubmit={this.createPlan}>
            Choose a name for your plan
            <Input
              value={this.state.name}
              onChange={this.handleChangeName}
              placeholder="Plan name"
            />

            <Button onClick={this.goBack}>Back</Button>
            <Button
              disabled={!this.state.name && "disabled"}
              type="submit"
            >
              Create Plan
            </Button>
          </form>
        )}

        {this.state.mode === "UPDATE_CURRENT_PLAN" && (
          <div>
            This will replace all the utms and settings of plan {this.props.plans[campaign.planId]}. This action cannot be undone. Are you sure you want to do this?
            <Button onClick={this.goBack}>Back</Button>
            <Button onClick={this.updateCurrentPlan}>Confirm</Button>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    currentCampaign: state.currentCampaign,
    plans: state.plans,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    createPlanRequest: (payload, cb) => dispatch({type: CREATE_PLAN_REQUEST, payload, cb}),
    updatePlanRequest: (payload, cb) => dispatch({type: UPDATE_PLAN_REQUEST, payload, cb}),
  }
}

const ConnectedSavePlan = connect(mapStateToProps, mapDispatchToProps)(SavePlanFromCampaign)
export default ConnectedSavePlan
