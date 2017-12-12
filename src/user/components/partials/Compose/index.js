import { Component } from 'react';
import { connect } from 'react-redux'
import {
  UPDATE_CAMPAIGN_REQUEST,
  CREATE_POST_REQUEST,
  DESTROY_POST_REQUEST,
  UPDATE_POST_REQUEST,
  SET_CURRENT_MODAL,
  SET_CURRENT_POST,
  PUBLISH_CAMPAIGN_REQUEST,
} from 'constants/actionTypes'
import { Icon, Button, Flexbox } from 'shared/components/elements'
import { Select, ConfirmationPopup } from 'shared/components/groups'
import { SocialLogin } from 'shared/components/partials'
import { ProviderAccountsDetails, PostEditor, AddPost, PostPicker, CampaignPostWrapper } from 'user/components/partials'
import {formActions, alertActions} from 'shared/actions'
import { withRouter } from 'react-router-dom'
import {PROVIDERS} from 'constants/providers'
import theme from 'theme'
import classes from './style.scss'

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
      publishing: false,
    }

    this.handleLinkProvider = this.handleLinkProvider.bind(this)
    this.saveCampaignPosts = this.saveCampaignPosts.bind(this)
    this.toggleAdding = this.toggleAdding.bind(this)
    this.togglePublishing = this.togglePublishing.bind(this)
    this.publish = this.publish.bind(this)
    this._hasContent = this._hasContent.bind(this)
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
    if (!value) {}
    this.setState({addingPost: provider || value})
  }

  //persist images here
  //if before, might be persisting several images they never actually use. Might not be a big deal, especially if can clean up well later. BUt there is cost issue
  //
  saveCampaignPosts() {
    const campaignPostsFormArray = _.values(this.props.campaignPostsForm.params)
    const persistedPosts = this.props.currentCampaign.posts || []

    const cb = () => {
      //Was only reseting when currentPost was not saved, since it got a new Id and was just a big mess. But...just do all the time
      //if (this.props.currentPost && typeof this.props.currentPost.id === "string") {
        this.props.setCurrentPost(false)
      //}
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

        this.props.updatePostRequest(post, cb)
      }
    }
  }

  handleLinkProvider() {
    this.props.setCurrentModal("LinkProviderAccountModal")
  }

  //make sure posts have either contentUrl or text
  _hasContent() {
    const campaignPosts = this.props.currentCampaign.posts || []
    return (
      this.props.currentCampaign.contentUrl ||
      campaignPosts.every((post) =>
        post.text
      )
    )
  }

  togglePublishing(value = !this.state.publishing) {
    //make sure all posts have text or contentUrl or image
    const hasContent = this._hasContent()
    const campaignPosts = this.props.currentCampaign.posts || []
    const postProviderAccountIds = campaignPosts.map((post) => post.providerAccountId)
    const postProviderAccounts = Helpers.flattenProviderAccounts().filter((account) => postProviderAccountIds.includes(account.id))
    const accountsMissingToken = postProviderAccounts.filter((account) => !account.accessToken)

    if (!hasContent) {
      alertActions.newAlert({
        title: "Content required for all posts:",
        message: "Please either add a url for your content, or add text to your posts",
        level: "DANGER",
      })

    } else if (accountsMissingToken.length) {
      //to make sure we have access tokens

      let messages = []
      let accountNames = accountsMissingToken.map((account) => `${Helpers.providerFriendlyName(account.provider)} (${account.userName || account.email})`)

      messages.push(`Please login to ${accountNames.join("; ")}`)
      let alertMessage = messages.join("; ")
      alertMessage += ". Then try publishing again."

      alertActions.newAlert({
        title: "Failure due to missing permissions:",
        message: alertMessage,
        level: "DANGER",
        options: {
          timer: false,
        }
      })

    } else {

      this.setState({publishing: value})
console.log("now publishing")
    }
  }

  publish() {
    this.setState({pending: true})
    alertActions.closeAlerts()

    const cb = () => {
      this.setState({
        pending: false,
        publishing: false,
        //mode: "savePlan",
      })

      formActions.matchCampaignStateToRecord()
      this.props.history.push(`/campaigns/${this.props.currentCampaign.id}`)
    }

    const onFailure = (response) => {
      this.setState({
        pending: false,
        publishing: false,
        //mode: "savePlan",
      })
      formActions.matchCampaignStateToRecord()
    }

    this.props.campaignPublishRequest(this.props.currentCampaign, cb, onFailure)
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const dirty = this.props.campaignPostsForm.dirty
    const {currentProvider, currentChannel} = this.state
    const campaignPosts = this.props.currentCampaign.posts || []


    //let accountsNotOnPlan = accountsForProvider //when implementing, make array of indices in reverse; remove starting from back to not mess up indicies while removing.

    return (
      <div>
        <h1 className="display-3">Compose Your Posts</h1>
        {this.state.status === "PENDING" && <Icon name="spinner" className="fa-spin" />}
        {this.state.addingPost ? (

          <AddPost
            toggleAdding={this.toggleAdding}
            type="post"
            currentProvider={this.state.addingPost}
          />

        ) : (

          <div>

            <hr/>
            <CampaignPostWrapper
              currentProvider={currentProvider}
              currentChannel={currentChannel}
            />

            <Button style="inverted" disabled={!dirty} onClick={this.saveCampaignPosts}>{dirty ? "Save Changes" : "All drafts saved"}</Button>
            <Flexbox justify="center">
              <Button style="inverted" onClick={this.props.switchTo.bind(this, "Start")}>Back</Button>
              {campaignPosts.length > 0 &&
                <div className={classes.publishButtonWrapper}>
                  <Button disabled={dirty} onClick={this.togglePublishing.bind(this, true)}>Publish All Posts</Button>

                  {this.state.publishing &&
                    <ConfirmationPopup
                      onConfirm={this.publish}
                      onCancel={this.togglePublishing.bind(this, false)}
                      pending={this.state.pending}
                    />
                  }
                </div>
              }
            </Flexbox>
          </div>
        )}

        <div className={this.state.hidePosts ? classes.hide : ""}>
          <PostPicker
            channel={this.state.currentChannel}
            toggleAdding={this.toggleAdding}
            addingPost={this.state.addingPost}
          />
        </div>

      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    currentPlan: state.currentPlan,
    currentPost: state.currentPost,
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
    setCurrentModal: (payload, modalOptions) => dispatch({type: SET_CURRENT_MODAL, payload, options: modalOptions}),
    campaignPublishRequest: (payload, cb, onFailure) => dispatch({type: PUBLISH_CAMPAIGN_REQUEST, payload, cb, onFailure}),
  }
}

const ConnectedCompose = withRouter(connect(mapStateToProps, mapDispatchToProps)(Compose))
export default ConnectedCompose
