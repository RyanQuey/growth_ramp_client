import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { userActions, errorActions } from 'shared/actions'
import { Button, Flexbox, Input } from 'shared/components/elements'
import { CHOOSE_PLAN, } from 'constants/actionTypes'


import classes from './style.scss'

class PlanPicker extends Component {
  constructor(props) {
    super(props)

    this.handleClickPlan = this.handleClickPlan.bind(this)
  }

  handleClickPlan (plan) {
    this.props.onPick(plan)
  }

  render() {
console.log("now picking");
    const plans = this.props.plans
    //TODO: set the title using props into the modal container
    return (
      <div>
        {plans && Object.keys(plans).map((planId) => (
          <button key={planId} onClick={this.handleClickPlan.bind(this, plans[planId])}>
            {plans[planId].name}
          </button>
        ))}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    plans: state.plans,
  }
}

export default connect(mapStateToProps)(PlanPicker)
