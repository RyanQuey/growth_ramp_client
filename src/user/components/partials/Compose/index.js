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
import { ProviderAccountsDetails, PostEditor, ChannelPicker, PostPicker, ChannelPosts } from 'user/components/partials'
import {formActions} from 'shared/actions'
import {PROVIDERS} from 'constants/providers'
import theme from 'theme'

class Compose extends Component {
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
      addingPost: false,
    }

    this.handleChooseProvider = this.handleChooseProvider.bind(this)
    this.handleChooseAccount = this.handleChooseAccount.bind(this)
    this.handleChooseChannel = this.handleChooseChannel.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
    this.handleLinkProvider = this.handleLinkProvider.bind(this)
  }

  componentWillReceiveProps(props) {
    //happens when create new campaign from navbar
    /*if (props.currentCampaign && !props.currentCampaign.planId) {
      this.props.switchTo("Start", true)
    }*/
    /*if (props.providerAccounts !== this.props.providerAccounts) {

    }*/
  }

  componentDidMount() {
    //initializing to match persisted record
    const campaignPosts = Helpers.safeDataPath(this.props, `currentCampaign.posts`, [])
    //convert to object for easy getting/setting
    const postObj = campaignPosts.reduce((acc, post) => {
      acc[post.id] = post
      return acc
    }, {})

    formActions.setParams("Compose", "posts", postObj)
  }

  openNewProviderModal(provider) {
    //provider will be the only provider they add an account for
    this.props.setCurrentModal("LinkProviderAccountModal", {provider})
  }

  handleChooseProvider(providerOption) {
    if (providerOption.value === this.state.currentProvider) {return }

    this.setState({
      currentProvider: providerOption.value,
      currentAccount: Helpers.safeDataPath(this.props, `providerAccounts.${providerOption.value}.0`, false),
    })
  }

  handleChooseAccount(accountOption) {
    this.setState({
      currentAccount: accountOption.value,
    })
  }

  handleChooseChannel(channelOption) {
    this.setState({
      currentChannel: channelOption.value,
    })
  }

  handleLinkProvider() {
    this.props.setCurrentModal("LinkProviderAccountModal")
  }

  handleChangeMode (mode) {
    this.setState({mode})
  }

  handleChangeName (e, errors) {
    Helpers.handleParam.bind(this, e, "name")()
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const {currentAccount, currentProvider, currentChannel} = this.state

    //let accountsNotOnPlan = accountsForProvider //when implementing, make array of indices in reverse; remove starting from back to not mess up indicies while removing.

    return (
      <div>
        <h1 className="display-3">Where should we promote it?</h1>
        {this.state.status === "PENDING" && <Icon name="spinner" className="fa-spin" />}
        <div>
          <PostPicker
            account={currentAccount}
            channel={this.state.currentChannel}
          />
        </div>

        <ChannelPicker
          currentProvider={currentProvider}
          currentAccount={currentAccount}
          currentChannel={currentChannel}
          handleChooseProvider={this.handleChooseProvider}
          handleChooseAccount={this.handleChooseAccount}
          handleChooseChannel={this.handleChooseChannel}
        />

        <div>
          {currentAccount &&
            <div key={currentAccount.id} >
              <img alt="No profile picture on file" src={currentAccount.photoUrl}/>
              <h5>{currentAccount.email || "No email on file"}</h5>
            </div>
          }

          {currentChannel ? (
            <ChannelPosts
              currentProvider={currentProvider}
              currentAccount={currentAccount}
              currentChannel={currentChannel}
            />
          ) : (
            <div>Pick a channel to begin</div>
          )}
          <Button style="inverted" onClick={this.handleLinkProvider}>Add another {PROVIDERS[currentProvider].name} account</Button>
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
    campaignPosts: Helpers.safeDataPath(state.forms, "Compose.posts", {}),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateCampaignRequest: (payload) => {dispatch({type: UPDATE_CAMPAIGN_REQUEST, payload})},
    updatePlanRequest: (payload) => {dispatch({type: UPDATE_PLAN_REQUEST, payload})},
    setCurrentModal: (payload, modalOptions) => dispatch({type: SET_CURRENT_MODAL, payload, options: modalOptions})
  }
}

const ConnectedCompose = connect(mapStateToProps, mapDispatchToProps)(Compose)
export default ConnectedCompose
