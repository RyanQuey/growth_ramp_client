import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Input } from 'shared/components/elements'
import { SET_INPUT_VALUE  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import { UTM_TYPES } from 'constants/plans'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class MessageTemplate extends Component {
  constructor() {
    super()

    this.state = {
    }

  }

  render() {
    return (
      <Flexbox direction="column">
        <h2>{this.props.message.type.titleCase()}</h2>
        <p>These are the defaults for the plan, but can be changed when composing an individual message</p>
        <div className={classes.messageTemplate}>
          {UTM_TYPES.map((type) => (
            <div key={type.value}>
              <h4>{type.label.titleCase()}</h4>
              <input type="checkbox"></input>&nbsp;Disable utm
              <Input placeholder={`set the default ${type.label.titleCase()} utm for this ${this.props.message.type.titleCase()}`}/>
            </div>
          ))}
        </div>
        <div className={classes.disableMessage}>
          <input type="checkbox"></input>&nbsp;Disable message
        </div>
      </Flexbox>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentPlan: state.currentPlan,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    updatePlanRequest: (payload) => {dispatch({type: UPDATE_PLAN_REQUEST, payload})},
  }
}

const ConnectedMessageTemplate = connect(mapStateToProps, mapDispatchToProps)(MessageTemplate)
export default ConnectedMessageTemplate

