import { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'shared/components/elements'

//shows up as the most of the content-container in a browser, or totally conditionally in mobile after provider has been chosen
//maybe all of this should fit in its parent instead?
class ConfigurePlanChannels extends Component {
  constructor() {
    super()

    this.state = {}
  }

  render() {
    if (this.props.hide) {
      return null
    }
    const provider = this.props.currentProvider
    const enabledChannels = this.props.currentPlan.channels

    return (
      <div>
        <h2>{provider.name}</h2>
        {enabledChannels.map((channel) => {
          return channel
        })}
        <Button onClick={this.addProvider}>Add a provider</Button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    tokenInfo: state.tokenInfo,
    currentPlan: state.currentPlan,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const ConnectedConfigurePlanChannels = connect(mapStateToProps, mapDispatchToProps)(ConfigurePlanChannels)
export default ConnectedConfigurePlanChannels


