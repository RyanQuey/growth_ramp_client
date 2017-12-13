import  { Component } from 'react';
import { connect } from 'react-redux'
import {
  withRouter,
} from 'react-router-dom'
import {
  PlanTable
} from 'user/components/partials'
import { Input, Button, Flexbox } from 'shared/components/elements'
import {
  CREATE_PLAN_REQUEST,
  ARCHIVE_PLAN_REQUEST,
} from 'constants/actionTypes'
import classes from './style.scss'

class Plans extends Component {
  constructor() {
    super()
    this.state = {
    }

    this.createPlan = this.createPlan.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
    this.toggleAdding = this.toggleAdding.bind(this)
  }

  toggleAdding (value = !this.state.adding) {
    this.setState({adding: value})
  }

  handleChangeName (value) {
    this.setState({name: value})
  }

  createPlan (e) {
    e.preventDefault()
    this.setState({pending: true});

    const payload = {
      name: this.state.name,
    }
    const cb = (newPlan) => {
      this.setState({pending: false})
      this.toggleAdding(false)
      this.props.history.push(`/plans/${newPlan.id}`)
    }
    const onFailure = () => {
      this.setState({pending: false})
      this.toggleAdding(false)
    }

    //will have to set the some other way, in case someone else makes one that's later than them or something, and firebase updates it
    this.props.createPlanRequest(payload, cb, onFailure)
  }

  render() {
    const c = this;
    let tabIndex = 0, contentIndex = 0
    const plans = this.props.plans
    const selectedPlan = this.state.currentPlan

    return (
      <div>
        <h1>Plans</h1>
        {this.state.adding ? (
          <form onSubmit={this.createPlan}>
            Choose a name for your plan
            <Input
              value={this.state.name}
              onChange={this.handleChangeName}
              placeholder="Plan name"
            />

            <Button style="inverted" onClick={this.toggleAdding}>Cancel</Button>
            <Button
              disabled={!this.state.name}
              type="submit"
              pending={this.state.pending}
            >
              Create Plan
            </Button>
          </form>

        ) : (
          <Button className={classes.topNewPlanButton} onClick={this.toggleAdding}>New Plan</Button>
        )}
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
        {Object.keys(plans).length > 4 && !this.state.adding && (
          <Button onClick={this.toggleAdding}>New Plan</Button>
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
    createPlanRequest: (payload, cb, onFailure) => dispatch({type: CREATE_PLAN_REQUEST, payload, cb, onFailure}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Plans))


