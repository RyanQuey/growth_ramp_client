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
class CampaignPostWrapper extends Component {
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

    formActions.setParams("EditCampaign", "posts", {[post.id]: post})
    this.props.setCurrentPost(null)
  }

  //takes posts from all providers and accounts and organizes by channelType
  channelPosts(posts) {
   /* const postsArray = _.values(posts)
    const channelPosts = postsArray.filter((post) => (
      post.providerAccountId == this.props.currentAccount.id && post.channelType === this.props.currentChannel
    ))

    return channelPosts*/
  }

  render() {
//TODO not using a lot of these
    const {currentAccount, currentProvider, currentChannel, currentPost, campaignPosts} = this.props
    if (this.props.hide || !currentPost || !Object.keys(currentPost).length ) {
      return null
    }

    //use the currentPost id, but that object reflects the persisted post. So use the form data
    let currentPostParams = currentPost && campaignPosts[currentPost.id]

    /*let channelPosts = []
    if (currentAccount && currentChannel) {
      channelPosts = this.channelPosts(campaignPosts) || []
    }
    //channel posts besides the current post
    const otherCampaignPosts = channelPosts.filter((p) => !currentPost || p.id !== currentPost.id)
console.log(channelPosts);*/

    return (
      <div key={currentPost.id}>
        <h2>{Helpers.providerFriendlyName(currentPost.provider)} {currentPost.channelType.titleCase()}</h2>

          <PostEditor
            record={currentPostParams}
            form="EditCampaign"
            type="Post"
            items="posts"
            hasContent={true}
          />
          <Button style="danger" onClick={this.removePost.bind(this, currentPost)}>Delete Post</Button>
        </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentCampaign: state.currentCampaign,
    currentPost: state.currentPost,
    user: state.user,
    campaignPosts: Helpers.safeDataPath(state.forms, "EditCampaign.posts.params", {}),
    //uploadedFiles: Helpers.safeDataPath(state.forms, "EditCampaign.uploadedFiles", []),
    postsParams: Helpers.safeDataPath(state.forms, "EditCampaign.posts.params", {}),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload, provider) => dispatch({type: SET_CURRENT_MODAL, payload, options: {oneProviderOnly: provider}}),
    setCurrentPost: (payload) => dispatch({type: SET_CURRENT_POST, payload}),
    updatePostRequest: (payload) => {dispatch({type: UPDATE_POST_REQUEST, payload})},
  }
}

const ConnectedCampaignPostWrapper = connect(mapStateToProps, mapDispatchToProps)(CampaignPostWrapper)
export default ConnectedCampaignPostWrapper

