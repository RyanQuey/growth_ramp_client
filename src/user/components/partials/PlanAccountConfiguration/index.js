import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button } from 'shared/components/elements'
import { MessageTemplate } from 'user/components/partials'
import { SET_INPUT_VALUE, SET_CURRENT_MODAL, UPDATE_PLAN_REQUEST  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class PlanAccountConfiguration extends Component {
  constructor() {
    super()

    this.state = {
      currentMessage: null,
    }

    this.newMessage = this.newMessage.bind(this)
    this.chooseMessage = this.chooseMessage.bind(this)
    this.sortConfigurationsByChannel = this.sortConfigurationsByChannel.bind(this)
  }

  chooseMessage(message) {
    this.setState({currentMessage: message})
  }

  newMessage (channelName) {
    const permittedChannels = Helpers.permittedChannels(this.props.account)
    if (permittedChannels.includes(channelName)) {
      const plan = Object.assign({}, this.props.currentPlan)

      const messageTemplate = {
        providerAccountId: this.props.account.id,
        type: channelName,
        active: true,
      }

      const channelTemplates = Helpers.safeDataPath(plan, `channelConfigurations.${this.props.account.provider}.messageTemplates`, false)
      if (channelTemplates) {
        channelTemplates.push(messageTemplate)
      } else {
        _.set(plan, `channelConfigurations.${this.props.account.provider}.messageTemplates`, [messageTemplate])
      }

      this.props.updatePlanRequest(plan)

    } else {
      //prompt to give permission
      //will eventually use a store to tell modal to only show this account
      this.props.setCurrentModal("LinkProviderAccountModal")

    }
  }

  sortConfigurationsByChannel(configurations) {
    const sorted = {}
    for (let i = 0; i < configurations.length; i++) {
      let configuration = configurations[i]

      //only one configurations for this account
      if (configuration.providerAccountId == this.props.account.id) {
        let channel = configuration.type
        if (sorted[channel]) {
          sorted[channel].push(configuration)
        } else {
          sorted[channel] = [configuration]
        }
      }
    }

    return sorted
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const account = this.props.account
    const availableChannels = PROVIDERS[account.provider].channels
    const messageTemplates = Helpers.safeDataPath(this.props, `currentPlan.channelConfigurations.${account.provider}.messageTemplates`, [])

    const sorted = this.sortConfigurationsByChannel(messageTemplates)
console.log(sorted);

    return (
      <Flexbox>
        <div className={classes.messageMenu}>
          {Object.keys(availableChannels).map((channelName) => (
            <div key={channelName}>
              <h3>{channelName.titleCase()}s</h3>
              {sorted[channelName] && sorted[channelName].map((message, index) => (
                <Button key={index} onClick={this.chooseMessage.bind(this, message)}>{index}</Button>
              ))}
              <Button onClick={this.newMessage.bind(this, channelName)}>Add {channelName.titleCase()}</Button>
            </div>
          ))}
        </div>
        <div className={classes.messageTemplate}>
          {this.state.currentMessage ? (
            <MessageTemplate message={this.state.currentMessage}/>
          ) : (
            <h3>Choose a message</h3>
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
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    updatePlanRequest: (payload) => {dispatch({type: UPDATE_PLAN_REQUEST, payload})},
  }
}

const ConnectedPlanAccountConfiguration = connect(mapStateToProps, mapDispatchToProps)(PlanAccountConfiguration)
export default ConnectedPlanAccountConfiguration

