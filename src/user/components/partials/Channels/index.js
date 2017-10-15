import { Component } from 'react';
import { connect } from 'react-redux'
import { take } from 'redux-saga/effects'
import {
  CREATE_PLAN_SUCCESS,
  CREATE_PLAN_REQUEST,
  CHOOSE_PLAN,
} from 'constants/actionTypes'
import { Navbar } from 'shared/components/elements'
import theme from 'theme'

class Channels extends Component {
  constructor() {
    super()

    this.state = {
      status: 'READY', //other statuses include: 'PENDING'
      mode: 'CHOOSE_PLAN', //other modes include: 'ADD_PLAN', 'CONFIGURE_PLAN',
    }

    this.handleChooseProvider = this.handleChooseProvider.bind(this)
    this.handleAddProvider = this.handleAddProvider.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
  }

  componentWillReceiveProps(props) {
    if (props.providerAccounts !== this.props.providerAccounts) {
      //this.setState({status: 'updated'})
    }
  }

  handleChooseProvider(e) {
    let value = e.target.value
    this.setState({currentProvider: value})
  }

  handleAddProvider (e){
    e.preventDefault()
    this.setState({
      mode: 'ADD_PLAN'
    })
  }

  handleChangeName (e, errors) {
    Helpers.handleParam.bind(this, e, "name")()
  }

  handleRemoveProvider(planId, e) {
    e.preventDefault && e.preventDefault()
    //not yet removing the plan ID from that users plan list...
    //Not sure if I'll ever use that users plan list though
    //will probably either use a different action, or rename this one to just update any resource/update any plan
    this.props.setInputValue({
      path: `plans/${planId}`,
      value: null
    })
  }

  render() {
    if (this.props.hide) {
      return null
    }
    const c = this;
    const accounts = this.props.providerAccounts || []

    return (
      <div>
        <h1 className="display-3">Channels</h1>
        <Navbar className="nav justifyContentSpaceAround" background="white" color={theme.color.text}>
          <ul role="tablist">
            {Object.keys(accounts).map((provider) => (
              <li key={provider} ref={provider} onClick={this.handleChooseProvider}>
                {this.state.currentProvider === provider ? (
                  <strong>{provider}</strong>
                ) : (
                  <span>{provider}</span>
                )}
              </li>
            ))}
          </ul>
        </Navbar>

        <div>
          {accounts.length === 0 ? (
            <h3>No social network accounts configured yet; add one more accounts before continuing</h3>
          ) : (
            <div>

            </div>
          )}

          <button>Add a social network account</button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    currentPlan: state.currentPlan,
    providerAccounts: state.providerAccounts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const ConnectedChannels = connect(mapStateToProps, mapDispatchToProps)(Channels)
export default ConnectedChannels
