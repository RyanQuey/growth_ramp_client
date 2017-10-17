import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { userActions, errorActions } from 'shared/actions'
import { Button, Flexbox, Input } from 'shared/components/elements'
import { UPDATE_USER_REQUEST } from 'constants/actionTypes'

import classes from './style.scss'

class PlanPicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      plan: null,
    }

    this.submit = this.submit.bind(this)
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
    updateUser: (userData) => store.dispatch({type: UPDATE_USER_REQUEST, payload: userData})
  }
}
const mapStateToProps = (state) => {
  return {
    plans: state.plans,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanPicker)
