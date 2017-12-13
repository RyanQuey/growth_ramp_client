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

//currently not using
class PlanPicker extends Component {
  constructor(props) {
    super(props)

  }

  render() {
    const plans = this.props.plans
    //TODO: set the title using props into the modal container
    //TODO populate plan post templates, so can list out how many of each provider they have ??
    return (

      <Flexbox flexWrap="wrap">
        {plans && Object.keys(plans).map((planId) => {
          return <Card key={planId} onClick={this.props.onPick.bind(this, plans[planId])} height="100px" maxWidth="100px" selected={this.props.selectedId == planId}>
            <h3>
              {plans[planId].name}
            </h3>

          </Card>
        })}
        {this.props.blankPlan && <Card
          onClick={this.props.startFromScratch}
          selected={!this.props.selectedId}
          height="100px"
        >
          <h3>
            Start from scratch
          </h3>
        </Card>}
      </Flexbox>
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

export default connect(mapStateToProps, mapDispatchToProps)(PlanPicker)
