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

  handleClickPlan (value) {
    this.props.choosePlan(this.props.plans[value])
    this.props.onPick()
  }

  render() {
console.log("now picking");
    const plans = this.props.plans
    //TODO: set the title using props into the modal container
    return (
      <select onChange={this.handleClickPlan}>
        <option value="">Select a plan</option>
        {plans && Object.keys(plans).map((planId) => {
          return (
            <option key={planId} value={planId}>{plans[planId].name}</option>
          )
        })}
      </select>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    choosePlan: (payload) => dispatch({type: CHOOSE_PLAN, payload}),
  }
}
const mapStateToProps = (state) => {
  return {
    plans: state.plans,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanPicker)
