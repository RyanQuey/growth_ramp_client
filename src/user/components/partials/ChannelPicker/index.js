import { Component } from 'react';
import { connect } from 'react-redux'
import {
  CREATE_PLAN_REQUEST,
  CHOOSE_PLAN,
  UPDATE_CAMPAIGN_REQUEST,
  UPDATE_PLAN_REQUEST,
  LIVE_UPDATE_PLAN_SUCCESS,
  LIVE_UPDATE_PLAN_FAILURE,
  SET_CURRENT_MODAL,
} from 'constants/actionTypes'
import { Navbar, Icon, Button } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { SocialLogin } from 'shared/components/partials'
import { ProviderAccountsDetails, PostEditor } from 'user/components/partials'
import {PROVIDERS} from 'constants/providers'
import theme from 'theme'

class ChannelPicker extends Component {
  constructor(props) {
    super(props)

    let currentProvider = "FACEBOOK"
    let currentAccount
    if (props.providerAccounts && Object.keys(props.providerAccounts).length > 0) {
      currentAccount = props.providerAccounts[currentProvider][0]
    } else {
      currentAccount = null
    }

    this.state = {
      status: 'READY', //other statuses include: 'PENDING'
      mode: 'VIEW', //other modes include: 'EDIT'
      currentProvider,// will just be the provider name
      currentAccount,//will be account obj
      currentChannel: "",//will be obj
    }

    this.sortPostsByChannel = this.sortPostsByChannel.bind(this)
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
      value: account.id,
    }
  }

  channelOption(channel) {
    return {
      label: channel.titleCase(),
      value: channel || null,
    }
  }

  sortPostsByChannel(posts) {
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
  }

  render() {
    if (this.props.hide) {
      return null
    }
    //get provider options
    let providers = Object.keys(PROVIDERS)
    let providerOptions = providers.map((p) => (
      this.providerOption(p)
    ))

    //get accounts options
    const accountsForProvider = this.props.providerAccounts[this.props.currentProvider] || []
    const accountOptions = accountsForProvider.map((a) => (
      this.accountOption(a)
    ))

    //get channel options
    const currentAccount = this.props.currentAccount
    let availableChannels, channelPosts, sortedPosts, channelOptions
    if (currentAccount) {
      availableChannels = Helpers.safeDataPath(PROVIDERS, `${this.props.currentAccount.provider}.channels`, {})
      channelOptions = Object.keys(availableChannels).map((key) => (
        this.channelOption(key)
      ))

      channelPosts = Helpers.safeDataPath(this.props, `currentCampaign.channelConfigurations.${this.props.currentProvider}.postTemplates`, [])
      sortedPosts = this.sortPostsByChannel(channelPosts)
    }
    //let accountsNotOnPlan = accountsForProvider //when implementing, make array of indices in reverse; remove starting from back to not mess up indicies while removing.

    return (
      <div>
        {this.props.status === "PENDING" && <Icon name="spinner" className="fa-spin" />}

        <div>
          <Select
            label="Platform"
            options={providerOptions}
            onChange={this.props.handleChooseProvider}
            currentOption={this.providerOption(this.props.currentProvider)}
            name="select-provider"
          />


          {accountsForProvider.length === 0 ? (
            <div>
              <h3>No social network accounts configured yet; add one more accounts before continuing</h3>
              <Button onClick={this.openNewProviderModal.bind(this, this.props.currentProvider)}>Add new {PROVIDERS[this.props.currentProvider].name} account</Button>
            </div>
          ) : (
            <div>
              <Select
                label="Account"
                options={accountOptions}
                onChange={this.props.handleChooseAccount}
                currentOption={this.accountOption(currentAccount)}
                name="select-account"
              />

              {currentAccount &&
                <Select
                  label="Channel"
                  options={channelOptions}
                  onChange={this.props.handleChooseChannel}
                  currentOption={this.channelOption(this.props.currentChannel)}
                  name="select-channel"
                />
              }
            </div>
          )}
        </div>

      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    currentPlan: state.currentPlan,
    providerAccounts: state.providerAccounts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateCampaignRequest: (payload) => {dispatch({type: UPDATE_CAMPAIGN_REQUEST, payload})},
    updatePlanRequest: (payload) => {dispatch({type: UPDATE_PLAN_REQUEST, payload})},
    setCurrentModal: (payload, modalOptions) => dispatch({type: SET_CURRENT_MODAL, payload, options: modalOptions})
  }
}

const ConnectedChannelPicker = connect(mapStateToProps, mapDispatchToProps)(ChannelPicker)
export default ConnectedChannelPicker
