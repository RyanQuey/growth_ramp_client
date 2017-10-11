import React, { Component } from 'react';
import firebase from 'firebase';
import { connect } from 'react-redux'
import { take } from 'redux-saga/effects'
import { FirebaseInput, Input } from './shared'
import fbApp from '../firebaseApp';
import {
  CREATE_PLAN_SUCCESS,
  SET_INPUT_VALUE,
  CREATE_PLAN_REQUEST,
  CHOOSE_PLAN,
} from '../actions'
import $ from 'jquery'; 
import helpers from '../helpers'

const database = fbApp.database();


class Start extends Component {
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
    helpers.handleParam.bind(this, e, "name")()
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
    const newestPlan = this.props.plans && this.props.plans[keys[keys.length -1]]

    //Configure the form
    let form
    if (this.state.mode === "ADD_PLAN") {form = (
      <div>
Make a new plan!!
          <form>
            <label>plan Name:</label>
              <Input 
                value={this.state.name} 
                data-key="name"
                onChange={this.handleChangeName}
              />
            <button type="submit" onClick={this.handlePlanCreate}>Submit</button>
          </form>    
      </div>
    )} else if (["CHOOSE_PLAN", "CONFIGURE_PLAN"].includes(this.state.mode)) {form = (
      <div>
        <div>
          {Object.keys(plans).length > 0 ? (
            <div> Select one of your previous plans 
              <select onChange={this.handleChoosePlan}>
                <option value="">Select a plan</option>
                {plans && Object.keys(plans).map((planId) => {    
                  return (
                    <option key={planId} value={planId}>{plans[planId].name}</option>
                  )
                })}
              </select>
            </div>
          ) : (
            <div> You don't have any plans yet. Make a new one instead!</div>
          )}

          {this.state.mode === "CONFIGURE_PLAN" ? (
            <div>
              <FirebaseInput 
                value={this.props.currentPlan.name} 
                name="planName"
                keys={`plans.${this.props.currentPlan.id}.name`}
              />
            </div>
          ) : (
            <div className="new-plan-container">
              <a href="#" onClick={this.handleAddPlan}>Add a new plan</a>
            </div> 
          )}
        </div> 
      </div> 
    )}

    return (
      <div>
        <h1 className="display-3">Start</h1>
        {form}
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
    setInputValue: (payload) => dispatch({type: SET_INPUT_VALUE, payload}),
    planCreateRequest: (payload) => dispatch({type: CREATE_PLAN_REQUEST, payload}),
    choosePlan: (payload) => dispatch({type: CHOOSE_PLAN, payload}),
  }
}

const ConnectedStart = connect(mapStateToProps, mapDispatchToProps)(Start)
export default ConnectedStart
