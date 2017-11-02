import { Component } from 'react';
import { connect } from 'react-redux'
import { take } from 'redux-saga/effects'
import {
  CREATE_PLAN_SUCCESS,
  SET_INPUT_VALUE,
  CREATE_PLAN_REQUEST,
  CHOOSE_PLAN,
} from 'constants/actionTypes'
import { Flexbox, Button, Input, Checkbox } from 'shared/components/elements'
import $ from 'jquery'; //TODO...

class Compose extends Component {
  constructor() {
    super()

    this.state = {
      FACEBOOK: {},
      TWITTER: {},
      LINKEDIN: {}
    }

    this.changeMessage = this.changeMessage.bind(this)
    this.submit = this.submit.bind(this)
  }

  componentWillReceiveProps(props) {
    if (props.plans !== this.props.plans) {
      //this.setState({status: 'updated'})
    }
  }

  submit(e) {
    this.props.choosePlan(this.props.plans[value])
  }

  changeMessage (provider, index, value) {
    providerMessages = this.state[provider]
    providerMessages[`message${index}`] = value

    this.setState({[provider]: providerMessages})
  }


  render() {
    if (this.props.hide) {
      return null
    }

    //Configure the form
    let form
    return   <div>
        <div>
          {Object.keys(this.props.currentPlan.channelConfigurations).map((provider) => {
console.log(provider);
console.log("watch out, twitter has a limit of 25 tweets per day per user account");
            const messages = this.props.currentPlan.channelConfigurations[provider]
            if (!messages.messageTemplates) {return <div></div>}
//technically, only do the active ones
            return messages.messageTemplates.map((message, index) => {
console.log(message, index);
const key = `message${index}`
              return (
                <div key={index}>
                  <Input
                    label={"message" + index}
                    placeholder={`Your message`}
                    onChange={this.changeMessage.bind(this, provider, index)}
                    value={this.state[provider][key]}
                  />
                </div>
              )
            })

          } )}
<button onClick={this.submit}>send them all</button>
        </div>
      </div>
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    posts: state.posts,
    plans: state.plans,
    currentPlan: state.currentPlan,
    tokenInfo: state.tokenInfo,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setInputValue: (payload) => dispatch({type: SET_INPUT_VALUE, payload}),
    planCreateRequest: (payload) => dispatch({type: CREATE_PLAN_REQUEST, payload}),
    choosePlan: (payload) => dispatch({type: CHOOSE_PLAN, payload}),
  }
}

const ConnectedCompose = connect(mapStateToProps, mapDispatchToProps)(Compose)
export default ConnectedCompose
