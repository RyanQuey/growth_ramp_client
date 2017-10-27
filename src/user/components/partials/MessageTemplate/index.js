import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Input, Checkbox } from 'shared/components/elements'
import {
  SET_CURRENT_PLAN,
  LIVE_UPDATE_PLAN_REQUEST,
  LIVE_UPDATE_PLAN_SUCCESS,
  LIVE_UPDATE_PLAN_FAILURE,
} from 'constants/actionTypes'
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

    this.disableMessage = this.disableMessage.bind(this)
    this.updatePlan = this.updatePlan.bind(this)
  }

  updateUtm(utmType, value, e) {
    let messageTemplate = Object.assign({}, this.props.message)
    messageTemplate[utmType].value = value

    this.updatePlan(messageTemplate)
  }
  disableUtm(utmType, checked, e) {
    let messageTemplate = Object.assign({}, this.props.message)
    messageTemplate[utmType].active = checked

    this.updatePlan(messageTemplate)
  }

  disableMessage(checked) {
    let messageTemplate = Object.assign({}, this.props.message)
    messageTemplate.active = checked
    this.updatePlan(messageTemplate)
  }

  updatePlan(updatedTemplate) {
    //targetting just the path to this messageTemplate
    const updatedPlan = Object.assign({}, this.props.currentPlan)
    _.set(updatedPlan, `channelConfigurations.${this.props.account.provider}.messageTemplates.${this.props.messageIndex}`, updatedTemplate)

    //update the store
    this.props.setCurrentPlan(updatedPlan)

    //live updating this one
    //should not update the plan reducer on its success, just give me an alert if it fails
    //performance might improve if only updating channelConfigurations each time, instead of the whole record, but this makes the code much simpler
    this.props.liveUpdatePlan(updatedPlan)
  }

  render() {
    const message = this.props.message

    return (
      <Flexbox direction="column">
        <h2>{message.type.titleCase()} {this.props.messageIndex}</h2>
        <div className={classes.disableMessage}>
          <Checkbox
            value={message.active}
            onChange={this.disableMessage}
          />&nbsp;Disable message
        </div>
        <div>These are the defaults for the plan, but can be changed when composing an individual message</div>
        <div className={classes.messageTemplate}>
          {message.active ? (
            UTM_TYPES.map((utmType) => {
              return <div key={utmType.value}>
                <Checkbox
                  value={message[utmType.value].active}
                  onChange={this.disableUtm.bind(this, utmType.value)}
                />&nbsp;Disable utm

                <label className={classes.utmHeader}>{utmType.label.titleCase()}</label>
                {message[utmType.value].active && <Input
                  placeholder={`set the default ${utmType.label.titleCase()} utm for this ${message.type.titleCase()}`}
                  onChange={this.updateUtm.bind(this, utmType.value)}
                  value={message[utmType.value].value}

                />}
              </div>
            })
          ) : (
            <div>This template will be saved but not used</div>
          )}
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
    //setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    liveUpdatePlan: (payload) => {dispatch({type: LIVE_UPDATE_PLAN_REQUEST, payload})},
    setCurrentPlan: (payload) => {dispatch({type: SET_CURRENT_PLAN, payload})},
  }
}

const ConnectedMessageTemplate = connect(mapStateToProps, mapDispatchToProps)(MessageTemplate)
export default ConnectedMessageTemplate

