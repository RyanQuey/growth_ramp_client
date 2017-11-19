import { Component } from 'react';
import { connect } from 'react-redux'
import {
  SET_INPUT_VALUE, PUBLISH_POST_REQUEST,
  CREATE_PLAN_REQUEST,
  SET_CURRENT_PLAN,
} from 'constants/actionTypes'

// currently just hodgepodge of leftover code scraps
class SavePlan extends Component {
  constructor() {
    super()

    this.state = {
      mode: 'CHOOSE_MODE', //other modes include: 'USE_EXISTING_PLAN', 'CREATE_NEW_PLAN', 'CHOOSE_NAME'
      newPlanType: "", //type of plan creation
    }

    this.goBack = this.goBack.bind(this)
    this.handleChoose = this.handleChoose.bind(this)
    this.createPlan = this.createPlan.bind(this)
  }

  createPlan (e) {
    e.preventDefault()
    this.setState({status: "PENDING"});
    let userId = this.props.user.id
    const defaults = {
      userId,
      name: this.state.name,
      associatedCampaign: this.props.currentCampaign.id,
    }

    const payload = Object.assign(defaults, this.state.planAttributes)
    //will have to set the some other way, in case someone else makes one that's later than them or something, and firebase updates it
    this.props.createPlanRequest(payload)
  }

  goBack (){
    //working backward through the flow
    if (this.state.mode === "CHOOSE_NAME") {
      this.setState({
        mode: "CREATE_NEW_PLAN"
      })

    } else if (this.state.mode === "CREATE_NEW_PLAN"){
      if (this.state.newPlanType) {
        this.setState({
          newPlanType: null
        })
      } else {
        this.setState({
          mode: "CHOOSE_MODE"
        })
      }

    } else if (this.state.mode === "USE_EXISTING_PLAN") {
      this.setState({mode: "CHOOSE_MODE"})

    }
  }

  handleChoose(option, e) {
    switch(option) {
      case "CHOOSE_MODE":
        this.setState({mode: option})

        break
      case "USE_EXISTING_PLAN":
        this.setState({mode: option})

        break
      case "CREATE_NEW_PLAN":
        this.setState({mode: option})

        break

      //types of new plans
      case "START_FROM_SCRATCH":
        this.setState({
          newPlanType: option,
          mode: "CHOOSE_NAME",
          planAttributes: {}
        })

        break
      case "COPY_AN_EXISTING_PLAN":
        const planAttributes = _.pick(this.props.currentPlan, ["channelConfigurations", "userId"])
        this.setState({
          newPlanType: option,
          mode: "CHOOSE_NAME",
          planAttributes,
        })

        break
    }
  }

  render() {
    if (this.props.hide) {
      return null
    }
    const namePicker = (
      <form onSubmit={this.createPlan}>
        Choose a name for your plan
        <Input
          value={this.state.name}
          data-key="name"
          onChange={this.handleChangeName}
          placeholder="Plan name"
        />
        <Button
          disabled={!this.state.name && "disabled"}
          type="submit"
        >
          Create Plan
        </Button>
      </form>
    )

    const c = this;
    const userId = this.props.user.uid

    return (
      <div id="send-container">
        <h1 className="display-3">Save?</h1>
Save your planned for later?
        {this.state.mode === "CHOOSE_NAME" && (
          <div>
            {namePicker}
          </div>
        )}

          {this.state.mode !== "CHOOSE_MODE" && (
            <Button onClick={this.goBack}>Back</Button>
          )}
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
    choosePlan: (payload) => {
      dispatch({type: SET_CURRENT_PLAN, payload})
    },
  }
}

const ConnectedSavePlan = connect(mapStateToProps, mapDispatchToProps)(SavePlan)
export default ConnectedSavePlan
