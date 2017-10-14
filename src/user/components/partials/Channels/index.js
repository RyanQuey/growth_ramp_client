import { Component } from 'react';
import { connect } from 'react-redux'
import { take } from 'redux-saga/effects'
import {
  CREATE_PLAN_SUCCESS,
  CREATE_PLAN_REQUEST,
  CHOOSE_PLAN,
} from 'constants/actionTypes'

class Channels extends Component {
  constructor() {
    super()

    this.state = {
      status: 'READY', //other statuses include: 'PENDING'
      mode: 'CHOOSE_PLAN', //other modes include: 'ADD_PLAN', 'CONFIGURE_PLAN',
    }

    this.handlePlanCreate = this.handlePlanCreate.bind(this)
    this.handleChoosePlan = this.handleChoosePlan.bind(this)
    this.reset = this.reset.bind(this)
    this.handleAddPlan = this.handleAddPlan.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
  }

  componentWillReceiveProps(props) {
    if (props.plans !== this.props.plans) {
      //this.setState({status: 'updated'})
    }
  }

  handleChoosePlan(e) {
    let value = e.target.value
    this.props.switchTo("Channels")
    this.props.choosePlan(this.props.plans[value])
  }

  handleAddPlan (e){
    e.preventDefault()
    this.setState({
      mode: 'ADD_PLAN'
    })
  }

  handleChangeName (e, errors) {
    Helpers.handleParam.bind(this, e, "name")()
  }

  handlePlanCreate (e){
    e.preventDefault()
    this.setState({status: "PENDING"});
    let userId = this.props.user.uid
    //will have to set the some other way, in case someone else makes one that's later than them or something, and firebase updates it
    this.props.planCreateRequest({userId, name: this.state.name})
    this.props.switchTo("Channels")
  }

  reset (e){
    e.preventDefault()
    this.setState({
      mode: 'CHOOSE_PLAN',
    })
  }

  handleRemovePlan(planId, e) {
    e.preventDefault()
    //not yet removing the plan ID from that users plan list...
    //Not sure if I'll ever use that users plan list though
    //will probably either use a different action, or rename this one to just update any resource/update any plan
    this.props.setInputValue({
      path: `plans/${planId}`,
      value: null
    })
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
        <h1 className="display-3">Channels</h1>
        {this.state.mode !== "CHOOSE_PLAN" && <button onClick={this.reset}>Back</button>}
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
    choosePlan: (payload) => dispatch({type: CHOOSE_PLAN, payload}),
  }
}

const ConnectedChannels = connect(mapStateToProps, mapDispatchToProps)(Channels)
export default ConnectedChannels
