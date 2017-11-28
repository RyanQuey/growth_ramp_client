import { Component } from 'react';
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'
import {
  //CREATE_PLAN_REQUEST,
  //CHOOSE_PLAN,
  //UPDATE_CAMPAIGN_REQUEST,
  //UPDATE_PLAN_REQUEST,
  //LIVE_UPDATE_PLAN_SUCCESS,
  //LIVE_UPDATE_PLAN_FAILURE,
  //SET_CURRENT_MODAL,
  //SET_CURRENT_POST,
} from 'constants/actionTypes'
import { Navbar, Icon, Button } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { SocialLogin } from 'shared/components/partials'
import {formActions} from 'shared/actions'
import { ProviderAccountsDetails, PostEditor } from 'user/components/partials'
import {PROVIDERS} from 'constants/providers'
import {UTM_TYPES} from 'constants/posts'
import theme from 'theme'

class AddPost extends Component {
  constructor(props) {
    super(props)

    this.state = {
      status: 'READY', //other statuses include: 'PENDING'
      mode: 'VIEW', //other modes include: 'EDIT'
      currentProvider: "",// will just be the provider name
      currentAccount: false,//will be account obj
      currentChannelType: "",//will be obj
    }

    //this.sortPostsByChannelType = this.sortPostsByChannelType.bind(this)
    this.newPost = this.newPost.bind(this)
    //this.handleChooseProvider = this.handleChooseProvider.bind(this)
    this.handleChooseAccount = this.handleChooseAccount.bind(this)
    this.handleChooseChannelType = this.handleChooseChannelType.bind(this)
    this.handleChooseChannel = this.handleChooseChannel.bind(this)
    this.openProviderModal = this.openProviderModal.bind(this)
  }

  componentWillReceiveProps(props) {
    if (props.currentProvider !== this.props.currentProvider) {
      this.setState({
        currentAccount: false,
        currentChannelType: "",
        currentChannel: false,
      })

    }
  }

  //only adding post if click button in post picker, which also sets the provider
  /*handleChooseProvider(providerOption) {
    if (providerOption.value === this.props.currentProvider) {return }

    this.setState({
      currentProvider: providerOption.value,
      currentAccount: false,
      currentChannelType: "",
    })
  }*/

  openProviderModal() {
    //prompt to give permission
    //will eventually use a store to tell modal to only show this account

    this.props.setCurrentModal("LinkProviderAccountModal", {provider: this.props.currentProvider})
  }

  handleChooseAccount(accountOption) {
    this.setState({
      currentAccount: accountOption.value,
      currentChannelType: "",
      currentChannel: "",
    })
  }

  handleChooseChannelType(channelTypeOption) {
    this.setState({
      currentChannelType: channelTypeOption.value,
      currentChannel: "",
    })
  }

  handleChooseChannel(channelOption) {
    this.setState({
      currentChannel: channelOption.value,
    })
  }

  newPost (e) {
    //build out the empty post object
    const channelId = this.state.currentChannel ? parseInt(this.state.currentChannel.id) : null

    const post = {
      channelType: this.state.currentChannelType,
      channelId,
      contentUrl: this.props.currentCampaign.contentUrl,
      userId: this.props.user.id,
      campaignId: this.props.currentCampaign.id,
      providerAccountId: this.state.currentAccount.id,
      provider: this.state.currentAccount.provider,
      planId: this.props.currentCampaign.planId,
    }

    //create id for it, like "draft1"
    let uuid = `not-saved-${uuidv4()}`
    post.id = uuid


    //set utm field options (set all to active)
    const utmDefaults = UTM_TYPES.reduce((acc, t) => {
      acc[t.value] = true
      return acc
    }, {})

    formActions.setParams("EditCampaign", "posts", {[uuid]: post})
    formActions.setOptions("EditCampaign", "posts", {[uuid]: {utms: utmDefaults}})
    this.props.toggleAdding(false, false, post)
  }

  providerOption(provider) {
    let accountsForProvider = this.props.providerAccounts[provider] || []
    return {
      label: `${PROVIDERS[provider].name} (${accountsForProvider.length} accounts)`,
      value: provider,
    }
  }

  accountOption(account) {
    return {
      label: `${account.userName || "no username"} (${account.email || "no email"})`,
      value: account,
    }
  }

  channelTypeOption(channelType) {
    return {
      label: channelType.titleCase(),
      value: channelType || null,
    }
  }

  channelOption(channel) {
    return {
      label: `${channel.name || channel.id}`,
      value: channel,
    }
  }

  /*sortPostsByChannelType(posts) {
    const sorted = {}
    for (let i = 0; i < posts.length; i++) {
      let post = posts[i]

      //only one posts for this account
      if (post.providerAccountId == this.props.account.id) {
        let channel = post.type
        if (sorted[channel]) {
          sorted[channel].push(post)
        } else {
          sorted[channel] = [post]
        }
      }
    }

    return sorted
  }*/

  render() {
    if (this.props.hide) {
      return null
    }
    let {currentAccount, currentChannelType, currentChannel} = this.state
    let currentProvider = this.props.currentProvider

    //get provider options
    let providers = Object.keys(PROVIDERS)
    let providerOptions = providers.map((p) => (
      this.providerOption(p)
    ))

    //get accounts options
    const accountsForProvider = this.props.providerAccounts[currentProvider] || []
    const accountOptions = accountsForProvider.map((a) => (
      this.accountOption(a)
    ))

    //get channel options
    let sortedPosts,
      channelTypeOptions,
      channelTypeName,
      channelTypeIsAllowed,
      channelTypeHasMultiple,
      channelOptions

    if (currentAccount) {
      let availableChannelTypes = Helpers.safeDataPath(PROVIDERS, `${currentProvider}.channelTypes`, {})
      channelTypeOptions = Object.keys(availableChannelTypes).map((key) => (
        this.channelTypeOption(key)
      ))

      let permittedChannelTypes = Helpers.permittedChannelTypes(currentAccount)

      if (currentChannelType) {
        channelTypeIsAllowed = permittedChannelTypes.includes(currentChannelType)

        channelTypeHasMultiple = PROVIDERS[currentProvider].channelTypes[currentChannelType].hasMultiple
        channelTypeName = PROVIDERS[currentProvider].channelTypes[currentChannelType].name
        let channelsForType = currentAccount.channels.filter((c) => c.type === currentChannelType)
        channelOptions = channelsForType.map((channel) => (
          this.channelOption(channel)
        ))
      }
    }

console.log(channelTypeHasMultiple, currentChannelType,channelTypeIsAllowed);
    const placeholder = {label: "select", value: null}
    //let accountsNotOnPlan = accountsForProvider //when implementing, make array of indices in reverse; remove starting from back to not mess up indicies while removing.

    return (
      <div>
        {!currentProvider || this.props.status === "PENDING" && <Icon name="spinner" className="fa-spin" />}

        {!this.props.providerAccounts || !this.props.providerAccounts[currentProvider].length ? (
          <div>
            <div>Growth Ramp needs your permission to make posts for {PROVIDERS[currentProvider].name}</div>
            <Button style="inverted" onClick={this.openProviderModal}>Grant Provider to continue</Button>
          </div>

        ) : (
          <div>
            <h2>Select where to send this {PROVIDERS[currentProvider].name} post to make</h2>
            {false && !(typeof this.props.addingPost === "string") && <Select
              label="Platform"
              options={providerOptions}
              onChange={this.handleChooseProvider}
              currentOption={currentProvider ? this.providerOption(currentProvider) : placeholder}
              name="select-provider"
            />}

            {currentProvider && accountsForProvider.length === 0 ? (
              <div>
                <h3>No social network accounts configured yet; add one more accounts before continuing</h3>
                <Button onClick={this.openProviderModal.bind(this, currentProvider)}>Add new {PROVIDERS[currentProvider].name} account</Button>
              </div>
            ) : (
              <div>
                <Select
                  label="Account"
                  options={accountOptions}
                  onChange={this.handleChooseAccount}
                  currentOption={currentAccount ? this.accountOption(currentAccount) : placeholder}
                  name="select-account"
                />

                {currentAccount &&
                  <Select
                    label="Channel Type"
                    options={channelTypeOptions}
                    onChange={this.handleChooseChannelType}
                    currentOption={currentChannelType ? this.channelTypeOption(currentChannelType) : placeholder}
                    name="select-channel-type"
                  />
                }


                {currentChannelType && !channelTypeIsAllowed && (
                  <div>
                    <div>Growth Ramp needs your permission to make {currentChannelType ? currentChannelType.titleCase() : "post"}s for {PROVIDERS[currentProvider].name}</div>
                    <Button style="inverted" onClick={this.openProviderModal}>Grant Provider to continue</Button>
                  </div>

                )}

              </div>
            )}
          </div>
        )}
        {currentChannelType && channelTypeIsAllowed && channelTypeHasMultiple && (
          <Select
            label={channelTypeName}
            options={channelOptions}
            onChange={this.handleChooseChannel}
            currentOption={currentChannel ? this.channelOption(currentChannel) : placeholder}
            name="select-channel"
          />
        )}

        {(
          (currentChannelType && channelTypeIsAllowed && !channelTypeHasMultiple) ||
          currentChannel
        ) && (
            <Button style="inverted" onClick={this.newPost}>Add a {currentChannelType.titleCase()}</Button>
        )}

        <Button style="inverted" onClick={this.props.toggleAdding.bind(this, false, this.state.addingPost)}>Cancel</Button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentCampaign: state.currentCampaign,
    user: state.user,
    currentPlan: state.currentPlan,
    providerAccounts: state.providerAccounts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //updateCampaignRequest: (payload) => {dispatch({type: UPDATE_CAMPAIGN_REQUEST, payload})},
    //updatePlanRequest: (payload) => {dispatch({type: UPDATE_PLAN_REQUEST, payload})},
    //setCurrentModal: (payload, modalOptions) => dispatch({type: SET_CURRENT_MODAL, payload, options: modalOptions}),
    //setCurrentPost: (payload) => dispatch({type: SET_CURRENT_POST, payload}),
    //updatePostRequest: (payload) => {dispatch({type: UPDATE_POST_REQUEST, payload})},
  }
}

const ConnectedAddPost = connect(mapStateToProps, mapDispatchToProps)(AddPost)
export default ConnectedAddPost
