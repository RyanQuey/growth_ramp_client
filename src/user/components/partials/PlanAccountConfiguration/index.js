import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button } from 'shared/components/elements'
import { SET_INPUT_VALUE  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class PlanAccountConfiguration extends Component {
  constructor() {
    super()

    this.newMessage = this.newMessage.bind(this)
    this.sortConfigurationsByChannel = this.sortConfigurationsByChannel.bind(this)
  }

  newMessage (channelName) {
    const permittedChannels = Helpers.permittedChannels(this.props.account)
    if (permittedChannels.includes(channelName)) {

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

      if (configuration.accountId === this.props.account.id) {
        let type = configuration.type
        if (sorted[type]) {
          sorted[type].push(configuration)
        } else {
          sorted[type] = [configuration]
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
    const channelConfigurations = Helpers.safeDataPath(this.props, `currentPlan.channelConfigurations.${account.provider}.channels`, [])
    const sorted = this.sortConfigurationsByChannel(channelConfigurations)

    return (
      <Flexbox>
        <div className={classes.messageMenu}>
          {Object.keys(availableChannels).map((channelName) => (
            <div key={channelName}>
              <h3>{channelName.titleCase()}</h3>
              {sorted[channelName] && sorted[channelName].map((config, index) => (
                <div>{index}</div>
              ))}
              <Button onClick={this.newMessage.bind(this, channelName)}>Add Message for this channel</Button>
            </div>
          ))}
        </div>
        <div className={classes.messageForm}>
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
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload})
  }
}

const ConnectedPlanAccountConfiguration = connect(mapStateToProps, mapDispatchToProps)(PlanAccountConfiguration)
export default ConnectedPlanAccountConfiguration

