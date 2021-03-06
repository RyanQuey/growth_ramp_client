import { Component } from 'react';
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'
import {
  SET_CURRENT_MODAL,
} from 'constants/actionTypes'
import { Navbar, Icon, Button, Flexbox } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { SocialLogin } from 'shared/components/partials'
import {formActions} from 'shared/actions'
import { ProviderAccountsDetails, PostEditor } from 'user/components/partials'
import {PROVIDERS} from 'constants/providers'
import {UTM_TYPES} from 'constants/posts'
import theme from 'theme'
import classes from './style.scss'

////////////////////////////////////
// NOTE for posts and postTemplates, depending on this.props.type
////////////////////////////////////

class AddPost extends Component {
  constructor(props) {
    super(props)

    this.state = {
      status: 'READY', //other statuses include: 'PENDING'
      mode: 'VIEW', //other modes include: 'EDIT'
      currentProvider: "",// will just be the provider name
      currentAccount: false,//will be account obj
      currentChannelType: "",//will be obj
      currentForum: "",
      currentPostingAsType: false,//will be obj
    }

    //this.sortPostsByChannelType = this.sortPostsByChannelType.bind(this)
    this.new = this.new.bind(this)
    //this.handleChooseProvider = this.handleChooseProvider.bind(this)
    this.handleChooseAccount = this.handleChooseAccount.bind(this)
    this.handleChooseChannelType = this.handleChooseChannelType.bind(this)
    this.handleChoosePostingAsType = this.handleChoosePostingAsType.bind(this)
    this.handleChooseForum = this.handleChooseForum.bind(this)
    this.handleChooseChannel = this.handleChooseChannel.bind(this)
    this.openProviderModal = this.openProviderModal.bind(this)
    this.openUnsupportedProviderModal = this.openUnsupportedProviderModal.bind(this)
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

  openUnsupportedProviderModal() {
    this.props.setCurrentModal("AddFakeProviderAccountModal")
  }
  handleChooseAccount(accountOption) {
    this.setState({
      currentAccount: accountOption.value,
      currentChannelType: "",
      currentChannel: "",
      currentPostingAsType: false,
    })
  }

  handleChooseForum(forumOption) {
    this.setState({
      currentForum: forumOption.value,
      currentChannel: "",
      currentPostingAsType: false,
    })
  }

  handleChooseChannelType(channelTypeOption) {
    this.setState({
      currentChannelType: channelTypeOption.value,
      currentForum: "",
      currentChannel: "",
      currentPostingAsType: false,
    })
  }

  handleChooseChannel(channelOption) {
    const newState = {
      currentChannel: channelOption.value,
      currentPostingAsType: false,
    }
    //if only one postingAsType, set that as the current state
    const postingAsTypes = Helpers.channelPostingAsTypes(channelOption.value) || {}
    const typeKeys = Object.keys(postingAsTypes)
    if (typeKeys && typeKeys.length === 1) {
      newState.currentPostingAsType = typeKeys[0]
    }
    this.setState(
      newState
    )
  }

  handleChoosePostingAsType(option){
    this.setState({
      currentPostingAsType: option.value,
    })
  }

  new (e) {
    //build out the empty post object
    const channelId = this.state.currentChannel ? parseInt(this.state.currentChannel.id) : null
    //just a temp id
    let tempUuid = `not-saved-${uuidv4()}`
    //set utm field options (set all to active)

    const isFake = !Helpers.safeDataPath(PROVIDERS, `${this.state.currentAccount.provider}.channelTypes.${this.state.currentChannelType}`)

    let newParams = {
      id: tempUuid,
      channelType: this.state.currentChannelType,
      channelId,
      forumName: this.state.currentForum,
      userId: this.props.user.id,
      providerAccountId: this.state.currentAccount.id,
      provider: this.state.currentAccount.provider,
      postingAs: this.state.currentPostingAsType || "SELF",
      pseudopost: isFake,
    }

    //set fields to active and params to active for each type
    UTM_TYPES.forEach((t) => {
      newParams[t.type] = {
        active: t.defaultActive,
        //note: currentCampaign not available if postTemplate
        value: t.defaultValue(this.state.currentAccount, this.state.currentChannel, this.props.currentCampaign, this.state.currentChannelType),
      }
      //if (t === "customUtm") {newParams[t.value].key = ""} //disabled customUtm
    })

    if (this.props.type === "post") {
      newParams.campaignId = this.props.currentCampaign.id
      newParams.contentUrl = this.props.currentCampaign.contentUrl
      newParams.planId = this.props.currentCampaign.planId
      formActions.setParams("EditCampaign", "posts", {[tempUuid]: newParams})
      //formActions.setOptions("EditCampaign", "posts", {[tempUuid]: {utms: utmDefaults}})

    } else if (this.props.type === "postTemplate") {
      newParams.planId = this.props.currentPlan.id
      formActions.setParams("EditPlan", "postTemplates", {[tempUuid]: newParams})
      //formActions.setOptions("EditPlan", "postTemplates", {[tempUuid]: {utms: utmDefaults}})
    }

    this.props.toggleAdding(false, false, newParams)
    this.props.toggleHidePosts(true)
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

  forumOption(forumName) {
    return {
      label: forumName,
      value: forumName,
    }
  }

  channelOption(channel) {
    return {
      label: `${channel.name || channel.id}`,
      value: channel,
    }
  }

  postingAsTypeOption(key) {
    const postingAsTypes = Helpers.channelPostingAsTypes(this.state.currentChannel)
    const type = postingAsTypes[key]

    return {
      label: type.label,
      value: key,
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

    //TODO move some of this logic into state, so doesn't get called on every rerender...
    let {currentAccount, currentChannelType, currentChannel, currentPostingAsType, currentForum} = this.state
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
      channelOptions,
      hasForums,
      forums,
      forumOptions,
      fakeChannels,
      fakeChannelTypes,
      isFake

    if (currentAccount) {
      let availableChannelTypes = Helpers.safeDataPath(PROVIDERS, `${currentProvider}.channelTypes`, {})
      fakeChannels = currentAccount.channels.filter((channel) => channel.unsupportedChannel)
      fakeChannelTypes = fakeChannels.map((channel) => channel.type)

      channelTypeOptions = Object.keys(availableChannelTypes).concat(fakeChannelTypes).map((key) => (
        this.channelTypeOption(key)
      ))

      let permittedChannelTypes = Helpers.permittedChannelTypes(currentAccount)

      if (currentChannelType) {
        //ie is custom made
        isFake = fakeChannelTypes.includes(currentChannelType)
        channelTypeIsAllowed = permittedChannelTypes.includes(currentChannelType) || isFake

        channelTypeHasMultiple = Helpers.channelTypeHasMultiple(null, currentProvider, currentChannelType)
        channelTypeName = Helpers.channelTypeFriendlyName(null,  currentProvider, currentChannelType)
        let channelsForType = currentAccount.channels.filter((c) => c.type === currentChannelType)

        //hasForums = Helpers.channelTypeHasForums(null, currentProvider, currentChannelType)

        /*
        if (hasForums) {
          forums = channelsForType.reduce((acc, channel) => {
            if (channel.forumName && !acc.includes(channel.forumName)) {
              acc.push(channel.forumName)
            }

            return acc
          }, [])

          forumOptions = forums.map((forum) => (
            this.forumOption(forum)
          ))

          if (currentForum) {
            channelOptions = channelsForType.filter((channel) => channel.forumName === currentForum).map((channel) => (
              this.channelOption(channel)
            ))
          }*/
      //  } else {
          channelOptions = channelsForType.map((channel) => (
            this.channelOption(channel)
          ))
       // }

      }
    }

    const placeholder = {label: "select", value: null}
    //let accountsNotOnPlan = accountsForProvider //when implementing, make array of indices in reverse; remove starting from back to not mess up indicies while removing.

    //will most often be false
    let postingAsTypes = currentChannel && Helpers.channelPostingAsTypes(currentChannel)
    const postingAsTypeOptions = postingAsTypes && Object.keys(postingAsTypes).length > 1 && Object.keys(postingAsTypes).map((key) => (
      this.postingAsTypeOption(key)
    ))

    return (
      <div>
        {!currentProvider || this.props.status === "PENDING" && <Icon name="spinner" className="fa-spin" />}

        {!this.props.providerAccounts || !Helpers.safeDataPath(this.props, `providerAccounts.${currentProvider}.length`, 0) ? (
          <div>
            <div>Growth Ramp needs your permission to make posts for {PROVIDERS[currentProvider].name}</div>
            <Button style="inverted" onClick={this.openProviderModal}>Grant Permission to Continue</Button>
          </div>

        ) : (
          <Flexbox className={classes.fields} direction="column" justify="center" align="center">
            <h2>Select where to send this {Helpers.providerFriendlyName(currentProvider)} post</h2>
            {false && !(typeof this.props.addingPost === "string") && <Select
              className={classes.select}
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
                  className={classes.select}
                  options={accountOptions}
                  onChange={this.handleChooseAccount}
                  currentOption={currentAccount ? this.accountOption(currentAccount) : placeholder}
                  name="select-account"
                />

                {currentAccount &&
                  <Select
                    label="Channel Type"
                    className={classes.select}
                    options={channelTypeOptions}
                    onChange={this.handleChooseChannelType}
                    currentOption={currentChannelType ? this.channelTypeOption(currentChannelType) : placeholder}
                    name="select-channel-type"
                  />
                }

                {currentChannelType && !channelTypeIsAllowed && (
                  <div>
                    <div>Growth Ramp needs your permission to make {currentChannelType ? currentChannelType.titleCase() : "post"}s for {PROVIDERS[currentProvider].name}</div>
                    <Button style="inverted" onClick={this.openProviderModal}>Grant Permission to Continue</Button>
                  </div>
                )}

                {currentChannelType && hasForums && (
                  forumOptions && forumOptions.length ? (
                    <Select
                      label={PROVIDERS[currentProvider].forums.name}
                      className={classes.select}
                      options={forumOptions}
                      onChange={this.handleChooseForum}
                      currentOption={currentForum ? this.forumOption(currentForum) : placeholder}
                      name="select-forum"
                    />
                  ) : (
                    <div>
                      <div>No channels have yet been configured for this account</div>
                      <Button style="inverted" onClick={this.openUnsupportedProviderModal}>Add channel</Button>

                    </div>
                  )
                )}

                {currentChannelType && channelTypeIsAllowed && channelTypeHasMultiple && (!hasForums || currentForum) && (
                  <Select
                    label={channelTypeName}
                    className={classes.select}
                    options={channelOptions}
                    onChange={this.handleChooseChannel}
                    currentOption={currentChannel ? this.channelOption(currentChannel) : placeholder}
                    name="select-channel"
                  />
                )}

                {currentChannel && postingAsTypeOptions && (
                  <Select
                    label="Who do you want to post as?"
                    className={classes.select}
                    options={postingAsTypeOptions}
                    onChange={this.handleChoosePostingAsType}
                    currentOption={currentPostingAsType ? this.postingAsTypeOption(currentPostingAsType) : placeholder}
                    name="select-posting-as-type"
                  />
                )}

              </div>
            )}
          </Flexbox>
        )}
        {(
          (currentChannelType && channelTypeIsAllowed && !channelTypeHasMultiple) ||
          currentChannel
        ) && (
            <Button style="inverted" onClick={this.new}>Add a {currentChannelType.titleCase()}{isFake ? " Post" : ""}</Button>
        )}

        <Button style="inverted" onClick={this.props.toggleAdding.bind(this, false, this.state.addingPost, false)}>Cancel</Button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    //has a currentCampaign or a currentPlan in props depending on whether it is a post or a postTemplate
    currentCampaign: state.currentCampaign,
    currentPlan: state.currentPlan,
    user: state.user,
    currentPlan: state.currentPlan,
    providerAccounts: state.providerAccounts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload, modalOptions) => dispatch({type: SET_CURRENT_MODAL, payload, options: modalOptions}),
  }
}

const ConnectedAddPost = connect(mapStateToProps, mapDispatchToProps)(AddPost)
export default ConnectedAddPost
