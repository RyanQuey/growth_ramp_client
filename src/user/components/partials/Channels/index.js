import { Component } from 'react';
import { connect } from 'react-redux'
import { take } from 'redux-saga/effects'
import {
  CREATE_PLAN_SUCCESS,
  CREATE_PLAN_REQUEST,
  CHOOSE_PLAN,
} from 'constants/actionTypes'

class Channels extends Component {
  constructor() {
    super()

    this.state = {
      status: 'READY', //other statuses include: 'PENDING'
      mode: 'CHOOSE_PLAN', //other modes include: 'ADD_PLAN', 'CONFIGURE_PLAN',
    }

    this.handleProviderCreate = this.handleProviderCreate.bind(this)
    this.handleChooseProvider = this.handleChooseProvider.bind(this)
    this.reset = this.reset.bind(this)
    this.handleAddProvider = this.handleAddProvider.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
  }

  componentWillReceiveProps(props) {
    if (props.plans !== this.props.plans) {
      //this.setState({status: 'updated'})
    }
  }

  handleChooseProvider(e) {
    let value = e.target.value
    this.props.switchTo("Channels")
    this.props.chooseProvider(this.props.plans[value])
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
    e.preventDefault()
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


    return (
      <div>
        <h1 className="display-3">Channels</h1>
        <Navbar className="nav justifyContentSpaceAround" background="white" color={theme.color.text}>
          <ul role="tablist">
            {Object.keys(sections).map((section) => (
              <li key={section} ref={section}>
                {this.state.currentSection === section ? (
                  <strong>{section}</strong>
                ) : (
                  <span>{section}</span>
                )}
              </li>
            ))}
          </ul>
        </Navbar>
        <div>

        </div>
        {this.state.mode !== "CHOOSE_PLAN" && <button onClick={this.reset}>Back</button>}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    currentPlan: state.currentPlan,
    providers: state.providers,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const ConnectedChannels = connect(mapStateToProps, mapDispatchToProps)(Channels)
export default ConnectedChannels
