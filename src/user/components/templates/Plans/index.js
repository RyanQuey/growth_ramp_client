import React, { Component } from 'react';
import { connect } from 'react-redux'
import {
  PlanPicker
} from 'user/components/partials'
import { Input, Button } from 'shared/components/elements'
import {
  CREATE_POST_REQUEST,
  ARCHIVE_PLAN_REQUEST,
} from 'constants/actionTypes'


class Plans extends Component {
  constructor() {
    super()
    this.state = {
      //will need to use a store, if this is ever used in subcomponents of the subcomponents
      currentPlan: {},
    }

    this.handleChoosePlan = this.handleChoosePlan.bind(this)
    this.destroyPlan = this.destroyPlan.bind(this)
  }

  componentDidMount() {

  }

  destroyPlan (plan) {
    //what to do with associated posts?
    //Not a problem if change the workflow as suggested to Jason
    this.props.archivePlanRequest(plan)
  }

  handleChoosePlan(plan) {
    this.setState({
      plan,
    })
    //TODO: want to use refs
    //might be able to use bind and the contentIndex ?
    //$(ref)[0].firstElementChild.click();
  }

  render() {
    const c = this;
    let tabIndex = 0, contentIndex = 0
    const plans = this.props.plans
    const selectedPlan = this.state.plan

    return (
      <div>
        <h1>Plans</h1>

        {Object.keys(plans).length > 0 ? (
          <div>
            <PlanPicker
              onPick={this.handleChoosePlan}
            />
            {/* <PlanDetails plan={this.state.plan}/>*/}
          </div>
        ) : (
          <div>
            <h3>There are currently no plans associated with this account</h3>
            <div>Either create a new one or ask for permission from an associate</div>
          </div>
        )}

        {selectedPlan &&
          <div>
            <hr/>
            <h3>{selectedPlan.name}</h3>
              <div>
                <Button onClick={this.destroyPlan.bind(this, selectedPlan)}>
                  Delete Plan ***DANGER***
                </Button>
              </div>
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    plans: state.plans,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    archivePlanRequest: (plan) => dispatch({type: ARCHIVE_PLAN_REQUEST, payload: plan}),
    createPostRequest: (data) => dispatch({type: CREATE_POST_REQUEST, payload: data}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Plans)


