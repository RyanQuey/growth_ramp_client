import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon } from 'shared/components/elements'
import { PostCard } from 'user/components/partials'
import { SET_INPUT_VALUE, SET_CURRENT_MODAL, UPDATE_PLAN_REQUEST  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import {UTM_TYPES} from 'constants/plans'
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

    const plan = Object.assign({}, this.props.currentPlan)
    const channelTemplates = Helpers.safeDataPath(plan, `channelConfigurations.${this.props.account.provider}.postTemplates`, [])
    channelTemplates.splice(index, 1)

    this.props.updatePlanRequest(plan)
  }

  openPermissionModal() {
    //prompt to give permission
    //will eventually use a store to tell modal to only show this account
    this.props.setCurrentModal("LinkProviderAccountModal", this.props.currentProvider)
  }

  newPost (channelName) {
    //build out the empty post object
    const postTemplate = {
      providerAccountId: this.props.currentAccount.id,
      channel: channelName,
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
    let uuid = uuidv4()
    campaignPosts[uuid] = postTemplate

  }

  //takes posts from all providers and accounts and organizes by channel
  channelPosts(posts) {
    const postsArray = _.keys(posts)
    const channelPosts = postsArray.find((post) => (
      post.providerAccountId == this.state.currentProvider.id && post.channel === this.state.currentChannel
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
                <Button style="inverted" onClick={this.removePost}>Destroy</Button>
              </div>
            )}

            <Button style="inverted" onClick={this.newPost}>Add another {currentChannel.titleCase()}</Button>

          </div>
        ) : (
          <div>
            <div>Growth Ramp need your permission to make {currentChannel.titleCase()}s for {PROVIDERS[currentProvider].name}</div>
            <Button style="inverted" onClick={this.newPost}>Grant Permission</Button>
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
    campaignPosts: Helpers.safeDataPath(state.forms, "Compose.posts", {}),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload, provider) => dispatch({type: SET_CURRENT_MODAL, payload, options: {oneProviderOnly: provider}}),
    updatePlanRequest: (payload) => {dispatch({type: UPDATE_PLAN_REQUEST, payload})},
  }
}

const ConnectedChannelPosts = connect(mapStateToProps, mapDispatchToProps)(ChannelPosts)
export default ConnectedChannelPosts

