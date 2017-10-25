import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button } from 'shared/components/elements'
import { SET_INPUT_VALUE  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class PlanAccountConfiguration extends Component {
  constructor() {
    super()

    this.newMessage = this.newMessage.bind(this)
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

  render() {
    if (this.props.hide) {
      return null
    }

    const account = this.props.account
    const channels = PROVIDERS[account.provider].channels

    return (
      <div>
        <div>
          <h1>{this.props.currentProvider}</h1>

          {Object.keys(channels).map((channelName) => (
            <div>
              <h3>{channelName.titleCase()}</h3>
              <Button onClick={this.newMessage.bind(this, channelName)}>Add Message for this channel</Button>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    providerAccounts: state.providerAccounts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload})
  }
}

const ConnectedPlanAccountConfiguration = connect(mapStateToProps, mapDispatchToProps)(PlanAccountConfiguration)
export default ConnectedPlanAccountConfiguration

