import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { userActions, errorActions } from 'shared/actions'
import { Button, Flexbox, Input, Card } from 'shared/components/elements'
import { ButtonGroup } from 'shared/components/groups'
import {
  CHOOSE_PLAN,
  ARCHIVE_PLAN_REQUEST, //really just archives
} from 'constants/actionTypes'
import {
  withRouter,
} from 'react-router-dom'


import classes from './style.scss'

class PlanPicker extends Component {
  constructor(props) {
    super(props)

    this.editPlan = this.editPlan.bind(this)
    this.showPlan = this.showPlan.bind(this)
    this.removePlan = this.removePlan.bind(this)
  }

  showPlan (plan, e) {
    this.props.history.push(`/plans/${plan.id}`)
  }

  editPlan (plan, e) {
    //will fetch anyways when we get there, since have to if user goes direcly from the url bar
    this.props.history.push(`/plans/${plan.id}/edit`)
  }

  removePlan (plan, e) {
    //what to do with associated posts?
    //Not a problem if change the workflow as suggested to Jason
    this.props.archivePlanRequest(plan)
    this.setState({
      currentPlan: null,
    })
  }

  render() {
    let planIds = Object.keys(this.props.plans || {})
    //reversing to put newest on top; since I think organized by id by default
    planIds.reverse()

    //TODO: set the title using props into the modal container (will do a modal...or just a show view?? for each plan)
    //use flexbox. Assign consistent column lengths to still achieve tablelike look, but with control over spacing etc.
    return (
      <table className={classes.table}>
        <tbody>
        <tr>
          <th>Name</th>
          <th>Date Created</th>
          <th></th>
        </tr>
        {planIds.map((planId) => {
          const plan = this.props.plans[planId]
          //not sure why this keeps on happening, but it does
          if (!plan) {return null}

          return (
            <tr key={planId}>
              <td>
                {plan.name || "No name"}
              </td>
              <td>
                {moment(plan.createdAt).format("MM-DD-YYYY h:mm a")}
              </td>
              <td>
                <ButtonGroup vertical={true}>
                  <Button onClick={this.editPlan.bind(this, plan)}>Edit Plan</Button>
                  <Button onClick={this.showPlan.bind(this, plan)}>View Details</Button>
                  <Button onClick={this.removePlan.bind(this, plan)}>Delete</Button>
                </ButtonGroup>
              </td>
            </tr>
          )
        })}
        </tbody>
      </table>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const mapStateToProps = (state) => {
  return {
    plans: state.plans,
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlanPicker))
