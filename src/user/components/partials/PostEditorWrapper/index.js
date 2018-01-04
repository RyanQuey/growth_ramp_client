import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon } from 'shared/components/elements'
import { ConfirmationPopup } from 'shared/components/groups'
import { PostCard, PostEditor } from 'user/components/partials'
import {
  SET_CURRENT_MODAL,
  UPDATE_POST_REQUEST,
  DESTROY_POST_REQUEST,
  SET_CURRENT_POST  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class CampaignPostWrapper extends Component {
  constructor() {
    super()

    this.state = {
      pending: false,
      deleting: false,
      deletePending: false,
    }

    this.channelPosts = this.channelPosts.bind(this)
    this.removePost = this.removePost.bind(this)
    this.done = this.done.bind(this)
    this.toggleDeleting = this.toggleDeleting.bind(this)
    this.undoChanges = this.undoChanges.bind(this)
  }

  /* this was when using draft system, and saving all at once
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
    this.props.toggleHidePosts(false)
  }*/

  removePost() {
    this.setState({deletePending: true})

    const cb = () => {
      this.setState({deletePending: false})
      this.toggleDeleting(false)
      this.props.setCurrentPost(null)
      formActions.matchCampaignStateToRecord()
      this.props.toggleHidePosts(false)
    }


    if (typeof this.props.currentPost.id === "string") {
      cb()

    } else {
      this.props.destroyPostRequest(this.props.currentPost, cb)
    }
  }

  undoChanges() {
    formActions.matchCampaignStateToRecord()
console.log(this.props.currentPost);
    //if an unsaved post draft was just removed from undoing changes, go back to post picker
    if (!this.props.currentPost || Helpers.safeDataPath(this.props, "currentPost.id", "").includes("not-saved")) {
      this.props.toggleHidePosts(false)
    }
  }

  //takes posts from all providers and accounts and organizes by channelType
  channelPosts(posts) {
   /* const postsArray = _.values(posts)
    const channelPosts = postsArray.filter((post) => (
      post.providerAccountId == this.props.currentAccount.id && post.channelType === this.props.currentChannel
    ))

    return channelPosts*/
  }

  toggleDeleting (value = !this.state.deleting) {
    this.setState({deleting: value})
  }

  done(){
    this.props.setCurrentPost(null)
    this.props.toggleHidePosts(false)
  }

  render() {
//TODO not using a lot of these
    const {currentAccount, currentProvider, currentChannel, currentPost, campaignPosts, dirty} = this.props
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
        <PostEditor
          params={currentPostParams}
          form="EditCampaign"
          type="Post"
          items="posts"
          hasContent={true}
          togglePending={this.props.togglePending}
        />


        <Button style="inverted" disabled={!dirty} title={dirty ? "" : "No changes to undo"} onClick={this.undoChanges}>
          Undo Changes
        </Button>
        <Button disabled={this.props.pending} onClick={dirty ? this.props.saveAllPosts : this.done}>
          {dirty ? "Save changes" : "Done"}
        </Button>

        <div className={classes.popupWrapper}>
          <Button style="danger" onClick={this.toggleDeleting.bind(this, true)}>Delete Post</Button>
          {this.state.deleting &&
            <ConfirmationPopup
             onConfirm={this.removePost}
             onCancel={this.toggleDeleting.bind(this, false)}
             pending={this.state.deletePending}
             dangerous={true}
             side="top"
           />
          }
        </div>
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
    destroyPostRequest: (payload, cb) => {dispatch({type: DESTROY_POST_REQUEST, payload, cb})},
  }
}

const ConnectedCampaignPostWrapper = connect(mapStateToProps, mapDispatchToProps)(CampaignPostWrapper)
export default ConnectedCampaignPostWrapper

