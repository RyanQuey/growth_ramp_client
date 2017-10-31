import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { userActions, errorActions } from 'shared/actions'
import { Button, Flexbox, Input, Card } from 'shared/components/elements'
import {
  CHOOSE_PLAN,
  ARCHIVE_PLAN_REQUEST, //really just archives
} from 'constants/actionTypes'


import classes from './style.scss'

class PlanPicker extends Component {
  constructor(props) {
    super(props)

    this.destroyPlan = this.destroyPlan.bind(this)
  }

  destroyPlan (plan) {
    this.props.archivePlanRequest(plan)
  }

  render() {
    const plans = this.props.plans
    //TODO: set the title using props into the modal container
    return (
      <Flexbox direction="column">
        {plans && Object.keys(plans).map((planId) => (
          <Card>
            <h3>
              {plans[planId].name}
            </h3>

            <div>
              <button key={planId} onClick={this.destroyPlan.bind(this, plans[planId])}>
                Delete Plan ***DANGER***
              </button>
            </div>
          </Card>
        ))}
      </Flexbox>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    archivePlanRequest: (plan) => dispatch({type: ARCHIVE_PLAN_REQUEST, payload: plan}),
  }
}

const mapStateToProps = (state) => {
  return {
    plans: state.plans,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanPicker)
