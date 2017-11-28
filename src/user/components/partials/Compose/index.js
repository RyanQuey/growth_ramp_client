import { Component } from 'react';
import { connect } from 'react-redux'
import {
  UPDATE_CAMPAIGN_REQUEST,
  CREATE_POST_REQUEST,
  DESTROY_POST_REQUEST,
  UPDATE_POST_REQUEST,
  SET_CURRENT_MODAL,
  SET_CURRENT_POST,
} from 'constants/actionTypes'
import { Icon, Button } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { SocialLogin } from 'shared/components/partials'
import { ProviderAccountsDetails, PostEditor, AddPost, PostPicker, ChannelPosts } from 'user/components/partials'
import {formActions} from 'shared/actions'
import {PROVIDERS} from 'constants/providers'
import theme from 'theme'

class Compose extends Component {
  constructor(props) {
    super(props)

    /*let currentAccount
    if (props.providerAccounts && Object.keys(props.providerAccounts).length > 0) {
      currentAccount = props.providerAccounts[props.currentProvider][0]
    } else {
      currentAccount = null
    }*/

    this.state = {
      status: 'READY', //other statuses include: 'PENDING'
      mode: 'VIEW', //other modes include: 'EDIT'
      //currentProvider,// will just be the provider name
      //currentAccount,//will be account obj
      //currentChannel: "",//will be obj
      addingPost: false,
    }

    this.handleChangeName = this.handleChangeName.bind(this)
    this.handleLinkProvider = this.handleLinkProvider.bind(this)
    this.saveCampaignPosts = this.saveCampaignPosts.bind(this)
    this.toggleAdding = this.toggleAdding.bind(this)
  }

  componentWillReceiveProps(props) {
    //happens when create new campaign from navbar
    //only trigger if there is currently a campaign already set
    if (this.props.currentCampaign.id && props.currentCampaign.id !== this.props.currentCampaign.id) {
      this.props.switchTo("Start", true)
    }
    /*if (props.providerAccounts !== this.props.providerAccounts) {

    }*/
  }

  componentDidMount() {
  }

  openNewProviderModal(provider) {
    //provider will be the only provider they add an account for
    this.props.setCurrentModal("LinkProviderAccountModal", {provider})
  }

  toggleAdding(provider, value = !this.state.addingPost, currentPost = null) {
    //if provider is passed in, just starts making a post for that provider
    this.props.setCurrentPost(currentPost)
    this.setState({addingPost: provider || value})
  }

  //persist images here
  //if before, might be persisting several images they never actually use. Might not be a big deal, especially if can clean up well later. BUt there is cost issue
  //
  saveCampaignPosts() {
    const campaignPostsFormArray = _.values(this.props.campaignPostsForm.params)
    const persistedPosts = this.props.currentCampaign.posts || []

    const cb = () => {
      formActions.matchCampaignStateToRecord()
    }

    //should not update the post reducer on its success, just give me an alert if it fails

    //check if need to update or create each post
    for (let i = 0; i < campaignPostsFormArray.length; i++) {
      let post = Object.assign({}, campaignPostsFormArray[i])
      let utmFields = Object.assign({}, Helpers.safeDataPath(this.props.formOptions, `${post.id}.utms`, {}))

      // TO DESTROY
      if (post.toDelete) {
        //if not persisted yet, don't need to save anything
        if (typeof post.id === "string") {
          cb()
          continue

        } else {
          this.props.destroyPostRequest(post, cb)
        }

      // TO CREATE
      } else if (typeof post.id === "string") { //.slice(0, 9) === "not-saved") {
        delete post.id
        this.props.createPostRequest(post, cb)
        continue

      // TO UPDATE
      } else {
        //iterate over post attributes, to sort params
        if (!post.dirty) {
          //no need to update
          continue
        }
        delete post.dirty

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

          //should no longer be necessary, now checking in the backend
          if (_.isEqual(persistedPost[attribute], post[attribute])) {
            //trim down elements to update in case end up sending
            //especially because api seems to convert null to a string when setting to req.body...
            delete post[attribute]
          }
          //console.log("attribute": attribute);
//console.log("value: ", post[attribute], persistedPost[attribute]);
        }

        this.props.updatePostRequest(post, cb)
      }
    }

  }

  handleLinkProvider() {
    this.props.setCurrentModal("LinkProviderAccountModal")
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
            toggleAdding={this.toggleAdding}
            addingPost={this.state.addingPost}
          />
        </div>

        {this.state.addingPost ? (

          <AddPost
            toggleAdding={this.toggleAdding}
            currentProvider={this.state.addingPost}
          />

        ) : (

          <div>
            {currentAccount &&
              <div key={currentAccount.id} >
                <img alt="No profile picture on file" src={currentAccount.photoUrl}/>
                <h5>{currentAccount.email || "No email on file"}</h5>
              </div>
            }

            <ChannelPosts
              currentProvider={currentProvider}
              currentAccount={currentAccount}
              currentChannel={currentChannel}
            />

            <Button style="inverted" disabled={!dirty} onClick={this.saveCampaignPosts}>{dirty ? "Save changes" : "All drafts saved"}</Button>
          </div>
        )}
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
    campaignPostsForm: Helpers.safeDataPath(state.forms, "EditCampaign.posts", {}),
    uploadedFiles: Helpers.safeDataPath(state.forms, "EditCampaign.uploadedFiles", []),
    formOptions: Helpers.safeDataPath(state.forms, "EditCampaign.posts.options", {}),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentPost: (payload) => dispatch({type: SET_CURRENT_POST, payload}),
    updateCampaignRequest: (payload, cb) => {dispatch({type: UPDATE_CAMPAIGN_REQUEST, payload, cb})},
    updatePostRequest: (payload, cb) => {dispatch({type: UPDATE_POST_REQUEST, payload, cb})},
    destroyPostRequest: (payload, cb) => {dispatch({type: DESTROY_POST_REQUEST, payload, cb})},
    createPostRequest: (payload, cb) => {dispatch({type: CREATE_POST_REQUEST, payload, cb})},
    setCurrentModal: (payload, modalOptions) => dispatch({type: SET_CURRENT_MODAL, payload, options: modalOptions})
  }
}

const ConnectedCompose = connect(mapStateToProps, mapDispatchToProps)(Compose)
export default ConnectedCompose
