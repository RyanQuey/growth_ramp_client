import { Component } from 'react';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  Start,
  Send,
  Compose,
  ShowPlanFooter
} from 'user/components/partials'
import { SocialLogin } from 'shared/components/partials'
import { ProviderAccountsDetails, AddPostTemplate, PostTemplatePicker, PlanPostTemplates } from 'user/components/partials'
import { Navbar, Icon, Button, Input, Flexbox } from 'shared/components/elements'
import { FETCH_CURRENT_PLAN_REQUEST, SET_CURRENT_PLAN, CREATE_PLAN_REQUEST } from 'constants/actionTypes'
import theme from 'theme'
import { formActions } from 'shared/actions'

const sections = {
  Start,
  Compose,
  Send,
}

class ShowPlan extends Component {
  constructor() {
    super()
    this.state = {
      addingPost: false,
    }

    this.handleLinkProvider = this.handleLinkProvider.bind(this)
    this.saveCampaignPosts = this.saveCampaignPosts.bind(this)
    this.toggleAdding = this.toggleAdding.bind(this)
    this.setPlan = this.setPlan.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
  }

 componentDidMount() {
    //set current plan based on the url params, no matter what it was before
    const planId = this.props.match.params.planId
    this.setPlan(planId)
  }

  componentWillUnmount() {
    window.onbeforeunload = null
  }

  componentWillReceiveProps (props) {
    if (props.match.params.planId !== this.props.match.params.planId) {
      //editing a new plan, without remounting.
      //this would happen if click "New Plan" while editing a different one
      this.setPlan(props.match.params.planId)

    }

    //give popup if tries to leave while dirty
    //don't set multiple by only setting if doesn't exist yet
    if (props.dirty && !window.onbeforeunload) {
      window.onbeforeunload = function(e) {
        var dialogText = 'Form not saved; Are you sure you want to leave?';
        e.returnValue = dialogText;
        return dialogText;
      };

    } else if (!props.dirty && this.props.dirty) {
      //remove listener
      window.onbeforeunload = null
    }

  }

  setPlan (planId) {
    const currentPlan = this.props.plans[planId]
    //check if need to retrieve and/or populate posts
    if (!currentPlan || !currentPlan.postTemplatess) {
      //this action doesn't yet support any criteria
      this.setState({pending: true})
      this.props.fetchCurrentPlan(planId)
      //initializing to match persisted record
      formActions.matchPlanStateToRecord()

    } else {
      this.props.setCurrentPlan(currentPlan)
      //initializing to match persisted record
      formActions.matchPlanStateToRecord()
    }

  }

  handleChangeName (value, e, errors) {
    formActions.setParams("EditCampaign", "other", {name: value})
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

  render() {
    const c = this;
    const currentPlan = this.props.currentPlan //plans[this.props.match.params.planId]
    const mode = Helpers.safeDataPath(this.props, "match.params.editing", false) ? "EDIT" : "SHOW"
    const dirty = this.props.campaignPostsForm.dirty
    const {currentAccount, currentProvider, currentChannel} = this.state


    return (
      <div>
        {currentPlan ? (
          <div>
            {mode === "SHOW" ? (
              <h1>{currentPlan.name}</h1>
            ) : (
              <Input
                value={planParams.name}
                placeholder="Plan for best content"
                onChange={this.handleChangeName}
              />
            )}
            <div>
              <PostTemplatePicker
                account={currentAccount}
                channel={this.state.currentChannel}
                toggleAdding={this.toggleAdding}
                addingPost={this.state.addingPost}
              />
            </div>

            {this.state.addingPost ? (

              <AddPostTemplate
                toggleAdding={this.toggleAdding}
                currentProvider={this.state.addingPostTemplate}
              />

            ) : (

              <div>
                {currentAccount &&
                  <div key={currentAccount.id} >
                    <img alt="No profile picture on file" src={currentAccount.photoUrl}/>
                    <h5>{currentAccount.email || "No email on file"}</h5>
                  </div>
                }

                <PlanPostTemplates
                  currentProvider={currentProvider}
                  currentAccount={currentAccount}
                  currentChannel={currentChannel}
                />

                <Button style="inverted" disabled={!dirty} onClick={this.saveCampaignPosts}>{dirty ? "Save changes" : "All drafts saved"}</Button>
              </div>
            )}
          </div>
        ) : (
          <Icon name="spinner" size="5x"/>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    plans: state.plans,
    currentPlan: state.currentPlan,
    //if either form is dirty
    dirty: Helpers.safeDataPath(state.forms, "ShowPlan.posts.dirty", false) || Helpers.safeDataPath(state.forms, "ShowPlan.other.dirty", false) ,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //createPlanRequest: (data) => dispatch({type: CREATE_PLAN_REQUEST, payload: data}),
    fetchCurrentPlan: (data) => dispatch({type: FETCH_CURRENT_PLAN_REQUEST, payload: data}),
    setCurrentPlan: (data) => dispatch({type: SET_CURRENT_PLAN, payload: data}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ShowPlan))


