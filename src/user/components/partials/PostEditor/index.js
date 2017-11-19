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
class PostEditor extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.disablePost = this.disablePost.bind(this)
    this.updatePlan = this.updatePlan.bind(this)
  }

  updateUtm(utmType, value, e) {
    let postTemplate = Object.assign({}, this.props.post)
    postTemplate[utmType].value = value

    this.updatePlan(postTemplate)
  }
  disableUtm(utmType, checked, e) {
    let postTemplate = Object.assign({}, this.props.post)
    postTemplate[utmType].active = checked

    this.updatePlan(postTemplate)
  }

  disablePost(checked) {
    let postTemplate = Object.assign({}, this.props.post)
    postTemplate.active = checked
    this.updatePlan(postTemplate)
  }

  updatePlan(updatedTemplate) {
    //targetting just the path to this postTemplate
    const updatedPlan = Object.assign({}, this.props.currentPlan)
    _.set(updatedPlan, `channelConfigurations.${this.props.account.provider}.postTemplates.${this.props.postIndex}`, updatedTemplate)

    //update the store
    this.props.setCurrentPlan(updatedPlan)

    //live updating this one
    //should not update the plan reducer on its success, just give me an alert if it fails
    //performance might improve if only updating channelConfigurations each time, instead of the whole record, but this makes the code much simpler
    //this.props.liveUpdatePlan(updatedPlan)
    this.props.updatePostRequest(plan)
  }

  render() {
    const post = this.props.post

    return (
      <Flexbox direction="column">
        <h2>{post.type.titleCase()} {this.props.postIndex}</h2>
        <div className={classes.disablePost}>
          <Checkbox
            value={post.active}
            onChange={this.disablePost}
          />&nbsp;Disable post
        </div>
        <div>These are the defaults for the plan, but can be changed when composing an individual post</div>
        <div className={classes.postTemplate}>
          {post.active ? (
            <div>
              {UTM_TYPES.map((utmType) => (
                <div key={utmType.value}>
                  <Checkbox
                    value={post[utmType.value].active}
                    onChange={this.disableUtm.bind(this, utmType.value)}
                  />&nbsp;Disable utm

                  <label className={classes.utmHeader}>{utmType.label.titleCase()}</label>
                  {post[utmType.value].active && <Input
                    placeholder={`set the default ${utmType.label.titleCase()} utm for this ${post.type.titleCase()}`}
                    onChange={this.updateUtm.bind(this, utmType.value)}
                    value={post[utmType.value].value}

                  />}
                </div>
              ))}

              <div>
                {false && <Input
                  placeholder={`Your post`}
                  onChange={this.changeStuff}
                  value={post.value}
                />}
              </div>
            </div>
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
    currentPost: state.currentPost,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    liveUpdatePlan: (payload) => {dispatch({type: LIVE_UPDATE_PLAN_REQUEST, payload})},
    setCurrentPlan: (payload) => {dispatch({type: SET_CURRENT_PLAN, payload})},
  }
}

const ConnectedPostEditor = connect(mapStateToProps, mapDispatchToProps)(PostEditor)
export default ConnectedPostEditor

