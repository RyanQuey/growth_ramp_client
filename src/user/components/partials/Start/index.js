import { Component } from 'react';
import { connect } from 'react-redux'
import { take } from 'redux-saga/effects'
import {
  CREATE_PLAN_SUCCESS,
  SET_INPUT_VALUE,
  CREATE_PLAN_REQUEST,
} from 'constants/actionTypes'
import { Input } from 'shared/components/elements'
import { PlanPicker } from 'user/components/partials'
console.log(PlanPicker);

class Start extends Component {
  constructor() {
    super()

    this.state = {
      status: 'READY', //other statuses include: 'PENDING'
      mode: 'CHOOSE_MODE', //other modes include: 'USE_EXISTING_PLAN', 'CREATE_NEW_PLAN', 'CHOOSE_NAME'
      newPlanType: "", //type of plan creation
    }

    this.handleChoose = this.handleChoose.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
    this.createPlan = this.createPlan.bind(this)
    this.goBack = this.goBack.bind(this)
  }

  componentWillReceiveProps(props) {
    //now switching after choosing a plan option
    if (props.currentPlan !== this.props.currentPlan) {
      this.props.switchTo("Channels")
    }
  }

  handleClickPlan(e) {
    let value = e.target.value
    this.setState({
      mode: "CHOOSE_PLAN_OPTIONS",
      plan: this.props.plans[value]
    })
  }

  handleChoose(option) {
console.log(option);
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

  createPlan (e) {
    e.preventDefault()
    this.setState({status: "PENDING"});
    let userId = this.props.user.id
    const defaults = {
      userId,
      name: this.state.name,
    }

    const payload = Object.assign(defaults, this.state.planAttributes)
    //will have to set the some other way, in case someone else makes one that's later than them or something, and firebase updates it
    this.props.createPlanRequest(payload)
  }

  handleChangeName (e, errors) {
    //seems a little unnecessary...
    Helpers.handleParam.bind(this, e, "name")()
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

  render() {
    if (this.props.hide) {
      return null
    }
    const c = this;
    const userId = this.props.user.uid
    const plans = this.props.plans
    const keys = plans && Object.keys(plans)

    const namePicker = (
      <form>
        Choose a name for your plan
        <Input
          value={this.state.name}
          data-key="name"
          onChange={this.handleChangeName}
          placeholder="Plan name"
        />
        <button
          onClick={this.createPlan}
          type="submit"
        >
          Create Plan
        </button>
      </form>
    )

    return (
      <div>
        <h1 className="display-3">Start</h1>

        {this.state.mode === "CHOOSE_MODE" && (
          <div>
            {Object.keys(plans).length === 0 ? (
              <div>
                <h4>You don't have any plans yet. Make a new one instead!</h4>
                {namePicker}
              </div>
            ) : (
              <div>
                <h4>
                  Select one of your plans to use or create a new one.
                </h4>
                {["USE_EXISTING_PLAN", "CREATE_NEW_PLAN"].map((option) => (
                  <button
                    key={option}
                    onClick={this.handleChoose.bind(this, option)}
                  >
                    {option.replace(/_/g, " ").titleCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {this.state.mode === "USE_EXISTING_PLAN" && (
          <div>
            <h4>
              Pick a plan to use. You will have a chance to edit your plan before sending your post.
            </h4>
            <PlanPicker />
          </div>
        )}

        {this.state.mode === "CREATE_NEW_PLAN" && (
          <div>
            <h4>
              Choose how you want to create this plan
            </h4>
            ["START_FROM_SCRATCH", "COPY_AN_EXISTING_PLAN"].map((option) => (
              <button
                key={option}
                onClick={this.handleChoose.bind(this, option)}
              >
                {option.replace(/_/g, " ").titleCase()}
              </button>
            ))
          </div>
        )}

        {this.state.newPlanType === "COPY_AN_EXISTING_PLAN" && (
          <div>
            <h4>
              Pick a plan to make a copy from. You will have a chance to edit your new plan before sending your post
            </h4>
            <PlanPicker />
          </div>
        )}

        {this.state.mode === "CHOOSE_NAME" && (
          <div>
            {namePicker}
          </div>
        )}

        <div>
          {this.state.mode !== "CHOOSE_MODE" && (
            <button onClick={this.goBack}>Back</button>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    posts: state.posts,
    plans: state.plans,
    currentPlan: state.currentPlan,
    tokenInfo: state.tokenInfo,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setInputValue: (payload) => dispatch({type: SET_INPUT_VALUE, payload}),
    createPlanRequest: (payload) => dispatch({type: CREATE_PLAN_REQUEST, payload}),
    choosePlan: (payload) => dispatch({type: CHOOSE_PLAN, payload}),
  }
}

const ConnectedStart = connect(mapStateToProps, mapDispatchToProps)(Start)
export default ConnectedStart
