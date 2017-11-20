import { Component } from 'react';
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'
import { Flexbox, Button, Icon } from 'shared/components/elements'
import { PostCard, PostEditor } from 'user/components/partials'
import { SET_INPUT_VALUE, SET_CURRENT_MODAL, UPDATE_POST_REQUEST  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import {formActions} from 'shared/actions'
import {UTM_TYPES} from 'constants/posts'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class ChannelPosts extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.newPost = this.newPost.bind(this)
    this.channelPosts = this.channelPosts.bind(this)
    this.removePost = this.removePost.bind(this)
    this.openPermissionModal = this.openPermissionModal.bind(this)
  }

  removePost(post, index) {
    if (this.state.currentPost === index) {
      this.setState({currentPost: null})
    }

    const channelTemplates = Helpers.safeDataPath(post, `channelConfigurations.${this.props.account.provider}.postTemplates`, [])
    channelTemplates.splice(index, 1)

    this.props.updatePostRequest(post)
  }

  openPermissionModal() {
    //prompt to give permission
    //will eventually use a store to tell modal to only show this account
    this.props.setCurrentModal("LinkProviderAccountModal", this.props.currentProvider)
  }

  newPost (e) {
    //build out the empty post object
    const postTemplate = {
      providerAccountId: this.props.currentAccount.id,
      channel: this.props.currentChannel,
      campaignId: this.props.currentCampaign.id,
      userId: this.props.user.id,
    }
    const utmDefaults = UTM_TYPES.map((t) => t.value)
    for (let i = 0; i < utmDefaults.length; i++) {
      postTemplate[utmDefaults[i]] = {active: true, value: ''}
    }

    //figure out where to put it
    let campaignPosts = Object.assign({}, this.props.campaignPosts)
    //create id for it, like "draft1"
    let uuid = `not-saved-${uuidv4()}`
    postTemplate.id = uuid
    campaignPosts[uuid] = postTemplate

    formActions.setParams("Compose", "posts", campaignPosts)
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

    const {currentAccount, currentProvider, currentChannel, campaignPosts} = this.props

    const permittedChannels = Helpers.permittedChannels(currentAccount)
    const channelIsAllowed = permittedChannels.includes(currentChannel)

    let channelPosts = []
    if (currentAccount && currentChannel) {
      channelPosts = this.channelPosts(campaignPosts) || []
    }
console.log(channelPosts);

    return (
      <Flexbox>
        {channelIsAllowed ? (
          <div className={classes.postMenu}>
            {!channelPosts.length && <div>No posts yet</div>}

            {channelPosts.map((post) =>
              <div>
                <PostEditor
                  account={currentAccount}
                  channel={currentChannel}
                  post={post}
                />
                <Button style="inverted" onClick={this.removePost.bind(this, post)}>Destroy Post</Button>
              </div>
            )}

            <Button style="inverted" onClick={this.newPost}>Add another {currentChannel.titleCase()}</Button>

          </div>
        ) : (
          <div>
            <div>Growth Ramp needs your permission to make {currentChannel.titleCase()}s for {PROVIDERS[currentProvider].name}</div>
            <Button style="inverted" onClick={this.openPermissionModal}>Grant Permission</Button>
          </div>
        )}
      </Flexbox>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentCampaign: state.currentCampaign,
    user: state.user,
    campaignPosts: Helpers.safeDataPath(state.forms, "Compose.posts.params", {}),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload, provider) => dispatch({type: SET_CURRENT_MODAL, payload, options: {oneProviderOnly: provider}}),
    updatePostRequest: (payload) => {dispatch({type: UPDATE_POST_REQUEST, payload})},
  }
}

const ConnectedChannelPosts = connect(mapStateToProps, mapDispatchToProps)(ChannelPosts)
export default ConnectedChannelPosts

