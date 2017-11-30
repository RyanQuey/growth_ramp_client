import React, { Component } from 'react';
import { connect } from 'react-redux'
import {
  PlanTable
} from 'user/components/partials'
import { Input, Button, Flexbox } from 'shared/components/elements'
import {
  CREATE_POST_REQUEST,
  ARCHIVE_PLAN_REQUEST,
} from 'constants/actionTypes'


class Plans extends Component {
  constructor() {
    super()
    this.state = {
    }

  }

  componentDidMount() {

  }

  render() {
    const c = this;
    let tabIndex = 0, contentIndex = 0
    const plans = this.props.plans
    const selectedPlan = this.state.currentPlan

    return (
      <div>
        <h1>Plans</h1>

        {Object.keys(plans).length > 0 ? (
          <Flexbox justify="center">
            <PlanTable
            />
          </Flexbox>
        ) : (
          <div>
            <h3>There are currently no plans associated with this account</h3>
            <div>Either create a new one or ask for permission from an associate</div>
          </div>
        )}
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


