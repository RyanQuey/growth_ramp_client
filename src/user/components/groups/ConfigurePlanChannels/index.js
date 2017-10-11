import { Component } from 'react';
import { connect } from 'react-redux'
import { SET_INPUT_VALUE  } from 'constants/actionTypes'
import { PROVIDERS, PROVIDER_IDS_MAP } from '../constants'

//shows up as the most of the content-container in a browser, or totally conditionally in mobile after provider has been chosen
//maybe all of this should fit in its parent instead?
class ConfigurePlanChannels extends Component {
  constructor() {
    super()

    this.state = {}
  }

  render() {
    if (this.props.hide) {
console.log("this should hide");
      return null
    }
console.log(this.props.hide);
    const provider = this.props.currentProvider
    const enabledChannels = this.props.currentPlan.channels

    return (
      <div>
        <h2>{provider.name}</h2>
        {enabledChannels.map((channel) => {
          return channel
        })}
        <button type="button" className="btn-outline-primary btn-sm" onClick={this.addProvider}>Add a provider</button>
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
    setInputValue: (payload) => dispatch({type: SET_INPUT_VALUE, payload}),
  }
}

const ConnectedConfigurePlanChannels = connect(mapStateToProps, mapDispatchToProps)(ConfigurePlanChannels)
export default ConnectedConfigurePlanChannels


