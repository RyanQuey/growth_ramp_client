import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { userActions, errorActions } from 'shared/actions'
import { Button, Flexbox, Input, Card } from 'shared/components/elements'
import { ButtonGroup, ConfirmationPopup } from 'shared/components/groups'
import {
  CHOOSE_PLAN,
  ARCHIVE_PLAN_REQUEST, //really just archives
} from 'constants/actionTypes'
import {
  withRouter,
} from 'react-router-dom'

import classes from './style.scss'

class PlanTable extends Component {
  constructor(props) {
    super(props)

    this.state = {
      deleting: false,
      deletePending: false,
    }

    this.editPlan = this.editPlan.bind(this)
    //this.showPlan = this.showPlan.bind(this)
    this.removePlan = this.removePlan.bind(this)
    this.toggleDeleting = this.toggleDeleting.bind(this)
  }

  /*
  showPlan (plan, e) {
    this.props.history.push(`/plans/${plan.id}`)
  }*/

  editPlan (plan, e) {
    //will fetch anyways when we get there, since have to if user goes direcly from the url bar
    this.props.history.push(`/plans/${plan.id}/edit`)
  }

  //can be id or false
  toggleDeleting (value) {
    this.setState({deleting: value})
  }

  removePlan (plan, e) {
    this.setState({deletePending: true})

    const cb = () => {
      this.setState({deletePending: false})
      this.toggleDeleting(false)
    }

    this.props.archivePlanRequest(plan, cb)
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
        {planIds.map((planId, index) => {
          const plan = this.props.plans[planId]
          //not sure why this keeps on happening, but it does
          if (!plan) {return null}
          let className = (index % 2) == 1 ? "oddRow" : "evenRow"

          return (
            <tr key={planId} className={classes[className]}>
              <td>
                {plan.name || "No name"}
              </td>
              <td>
                {moment(plan.createdAt).format("MM-DD-YYYY h:mm a")}
              </td>
              <td>
                <div className={classes.buttonStack}>
                  <Button onClick={this.editPlan.bind(this, plan)} small={true}>Edit</Button>
                  {false && <Button onClick={this.showPlan.bind(this, plan)} small={true}>Details</Button>}
                  <div className={classes.popupWrapper}>
                    <Button style="danger" onClick={this.toggleDeleting.bind(this, planId)} small={true}>Delete</Button>
                    <ConfirmationPopup
                      show={this.state.deleting === planId }
                      handleClickOutside={this.toggleDeleting.bind(this, false)}
                      onConfirm={this.removePlan.bind(this, plan)}
                      onCancel={this.toggleDeleting.bind(this, false)}
                      pending={this.state.deletePending}
                      dangerous={true}
                    />
                  </div>
                </div>
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
    archivePlanRequest: (campaign, cb) => dispatch({type: ARCHIVE_PLAN_REQUEST, payload: campaign, cb}),
  }
}

const mapStateToProps = (state) => {
  return {
    plans: state.plans,
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlanTable))
