import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Input, Checkbox } from 'shared/components/elements'
import {
  SET_CURRENT_POST,
  LIVE_UPDATE_POST_REQUEST,
  LIVE_UPDATE_POST_SUCCESS,
  LIVE_UPDATE_POST_FAILURE,
} from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import { UTM_TYPES } from 'constants/posts'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class PostEditor extends Component {
  constructor() {
    super()

    this.state = {
    }

  }

  updateUtm(utmType, value, e) {
    let post = Object.assign({}, this.props.post)
    post[utmType].value = value

    //update the post form
    let campaignPosts = Object.assign({}, this.props.campaignPosts)
    campaignPosts[post.id] = post

    formActions.setParams("Compose", "posts", campaignPosts)
  }

  disableUtm(utmType, checked, e) {
    //set the param
    let post = Object.assign({}, this.props.post)
    post[utmType].active = checked

    //update the post form
    let campaignPosts = Object.assign({}, this.props.campaignPosts)
    campaignPosts[post.id] = post

    formActions.setParams("Compose", "posts", campaignPosts)
  }

  render() {
    const post = this.props.post
console.log(post);
    return (
      <Flexbox direction="column">
        <h2>{post.channel.titleCase()}</h2>
        {false && <div className={classes.disablePost}>
          <Checkbox
            value={post.active}
            onChange={this.disablePost}
          />&nbsp;Disable post
        </div>}
        <div className={classes.postTemplate}>
            <div>
              {UTM_TYPES.map((utmType) => (
                <div key={utmType.value}>
                  <Checkbox
                    value={post[utmType.value].active}
                    onChange={this.disableUtm.bind(this, utmType.value)}
                  />&nbsp;Disable utm

                  <label className={classes.utmHeader}>{utmType.label.titleCase()}</label>
                  {post[utmType.value].active && <Input
                    placeholder={`${utmType.label.titleCase()} utm for this ${post.channel.titleCase()}`}
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
        </div>
      </Flexbox>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentPost: state.currentPost,
    currentPost: state.currentPost,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    liveUpdatePost: (payload) => {dispatch({type: LIVE_UPDATE_POST_REQUEST, payload})},
    setCurrentPost: (payload) => {dispatch({type: SET_CURRENT_POST, payload})},
  }
}

const ConnectedPostEditor = connect(mapStateToProps, mapDispatchToProps)(PostEditor)
export default ConnectedPostEditor

