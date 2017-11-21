import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon } from 'shared/components/elements'
import { PostCard, PostEditor } from 'user/components/partials'
import { SET_CURRENT_MODAL, UPDATE_POST_REQUEST, SET_CURRENT_POST  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class ChannelPosts extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.channelPosts = this.channelPosts.bind(this)
    this.removePost = this.removePost.bind(this)
  }

  removePost(post) {
    if (this.props.currentPost.id === post.id) {
      this.props.setCurrentPost(null)
    }

    post = Object.assign({}, post)
    post.toDelete = true
    let posts = Object.assign({}, this.props.campaignPosts)
    posts[post.id] = post

    formActions.setParams("Compose", "posts", {[post.id]: post})
  }

  //takes posts from all providers and accounts and organizes by channel
  channelPosts(posts) {
    const postsArray = _.values(posts)
    const channelPosts = postsArray.filter((post) => (
      post.providerAccountId == this.props.currentAccount.id && post.channel === this.props.currentChannel
    ))

    return channelPosts
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const {currentAccount, currentProvider, currentChannel, currentPost, campaignPosts} = this.props

    let channelPosts = []
    if (currentAccount && currentChannel) {
      channelPosts = this.channelPosts(campaignPosts) || []
    }
    //channel posts besides the current post
    const otherChannelPosts = channelPosts.filter((p) => !currentPost || p.id !== currentPost.id)
console.log(channelPosts);

    return (
      <Flexbox>
          <div className={classes.postMenu}>
            {!channelPosts.length && <div>No posts yet</div>}

            {currentPost && (
              <div key={currentPost.id}>
                <PostEditor
                  account={currentAccount}
                  channel={currentChannel}
                  post={currentPost}
                />
                <Button style="inverted" onClick={this.removePost.bind(this, currentPost)}>Destroy Post</Button>
              </div>
            )}
          </div>
      </Flexbox>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentCampaign: state.currentCampaign,
    currentPost: state.currentPost,
    user: state.user,
    campaignPosts: Helpers.safeDataPath(state.forms, "Compose.posts.params", {}),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload, provider) => dispatch({type: SET_CURRENT_MODAL, payload, options: {oneProviderOnly: provider}}),
    setCurrentPost: (payload) => dispatch({type: SET_CURRENT_POST, payload}),
    updatePostRequest: (payload) => {dispatch({type: UPDATE_POST_REQUEST, payload})},
  }
}

const ConnectedChannelPosts = connect(mapStateToProps, mapDispatchToProps)(ChannelPosts)
export default ConnectedChannelPosts

