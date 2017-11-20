import { Component } from 'react';
import { connect } from 'react-redux'
import {
  UPDATE_CAMPAIGN_REQUEST,
  CREATE_POST_REQUEST,
  UPDATE_POST_REQUEST,
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
    this.saveCampaignPosts = this.saveCampaignPosts.bind(this)
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
    this.matchRecordToState()
 }

  matchRecordToState() {
    const campaignPosts = Helpers.safeDataPath(store.getState(), `currentCampaign.posts`, [])
    //convert to object for easy getting/setting
    const postObj = campaignPosts.reduce((acc, post) => {
      acc[post.id] = post
      return acc
    }, {})

    formActions.setParams("Compose", "posts", postObj, false)

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

  //persist images here
  //if before, might be persisting several images they never actually use. Might not be a big deal, especially if can clean up well later. BUt there is cost issue
  //
  saveCampaignPosts() {
console.log("about to start");
    const campaignPostsArray = _.values(this.props.campaignPostsForm.params)
    const persistedPosts = this.props.currentCampaign.posts

    //should not update the post reducer on its success, just give me an alert if it fails
    const cb = () => {
      //synchronizing state with  persisted record
      this.matchRecordToState()
    }

    //check if need to update or create each post
    for (let i = 0; i < campaignPostsArray.length; i++) {
      let post = Object.assign({}, campaignPostsArray[i])
      let utmFields = Object.assign({}, Helpers.safeDataPath(this.props.formOptions, `${post.id}.utms`, {}))

      if (typeof post.id === "string") { //.slice(0, 9) === "not-saved") {
        delete post.id
        this.props.createPostRequest(post, cb)
        continue

      } else {
        //iterate over post attributes, to check for equality
        let isEqual = true
        //should never really be {}...but whatever
        let persistedPost = persistedPosts.find((p) => p.id === post.id) || {}
        let attributes = Object.keys(post)

        for (let attribute of attributes) {
          //don't need to check these
          if (["id", "userId"].includes(attribute)) {continue}

          //if utm is set to post, but field is disabled, set to empty string
          if (attribute.includes("Utm") && !utmFields[attribute]) {
            post[attribute] = ""
          }

          if (_.isEqual(persistedPost[attribute], post[attribute])) {
            //trim down elements to update in case end up sending
            //especially because api seems to convert null to a string when setting to req.body...
            delete post[attribute]

          } else {
            isEqual = false
          }
        }

        if (isEqual) {
          //no need to update
          continue
        }

        this.props.updatePostRequest(post, cb)
      }


    }

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

    const dirty = this.props.campaignPostsForm.dirty
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
          <Button style="inverted" disabled={!dirty} onClick={this.saveCampaignPosts}>{dirty ? "Save changes" : "Draft saved"}</Button>
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
    currentCampaign: state.currentCampaign,
    campaignPostsForm: Helpers.safeDataPath(state.forms, "Compose.posts", {}),
    uploadedFiles: Helpers.safeDataPath(state.forms, "Compose.uploadedFiles", []),
    formOptions: Helpers.safeDataPath(state.forms, "Compose.posts.options", {}),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateCampaignRequest: (payload) => {dispatch({type: UPDATE_CAMPAIGN_REQUEST, payload})},
    updatePostRequest: (payload, cb) => {dispatch({type: UPDATE_POST_REQUEST, payload, cb})},
    createPostRequest: (payload) => {dispatch({type: CREATE_POST_REQUEST, payload})},
    setCurrentModal: (payload, modalOptions) => dispatch({type: SET_CURRENT_MODAL, payload, options: modalOptions})
  }
}

const ConnectedCompose = connect(mapStateToProps, mapDispatchToProps)(Compose)
export default ConnectedCompose
