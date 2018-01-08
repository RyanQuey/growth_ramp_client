import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon } from 'shared/components/elements'
import { ConfirmationPopup } from 'shared/components/groups'
import { PostTemplateCard, PostEditor } from 'user/components/partials'
import { DESTROY_POST_TEMPLATE_REQUEST, SET_CURRENT_MODAL, UPDATE_POST_TEMPLATE_REQUEST, SET_CURRENT_POST_TEMPLATE,  } from 'constants/actionTypes'

import { PROVIDERS } from 'constants/providers'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class PostTemplateWrapper extends Component {
  constructor() {
    super()

    this.state = {
      pending: false,
      deleting: false,
      deletePending: false,
    }

    this.done = this.done.bind(this)
    this.channelPostTemplates = this.channelPostTemplates.bind(this)
    this.removePostTemplate = this.removePostTemplate.bind(this)
    this.toggleDeleting = this.toggleDeleting.bind(this)
    this.undoChanges = this.undoChanges.bind(this)
  }

  /*this was when just marking as deleting
  removePostTemplate(postTemplate) {
    if (this.props.currentPostTemplate.id === postTemplate.id) {
      this.props.setCurrentPostTemplate(null)
    }

    postTemplate = Object.assign({}, postTemplate)
    postTemplate.toDelete = true
    let postTemplates = Object.assign({}, this.props.planPostTemplates)
    postTemplates[postTemplate.id] = postTemplate

    formActions.setParams("EditPlan", "postTemplates", {[postTemplate.id]: postTemplate})
    this.props.setCurrentPostTemplate(null)
  }*/

  removePostTemplate() {
    this.setState({deletePending: true})

    const cb = () => {
      this.setState({deletePending: false})
      this.toggleDeleting(false)
      this.props.setCurrentPostTemplate(null)
      formActions.matchPlanStateToRecord()
      this.props.toggleHidePosts(false)
    }

    if (typeof this.props.currentPostTemplate.id === "string") {
      cb()

    } else {
      this.props.destroyPostTemplateRequest(this.props.currentPostTemplate, cb)
    }
  }

  undoChanges() {
    formActions.matchPlanStateToRecord()
    //if an unsaved post draft was just removed from undoing changes, go back to post picker
    if (!this.props.currentPostTemplate || Helpers.safeDataPath(this.props, "currentPostTemplate.id", "").includes("not-saved")) {
      this.props.toggleHidePosts(false)
    }
  }

  toggleDeleting (value = !this.state.deleting) {
    this.setState({deleting: value})
  }

  done(){
    this.props.setCurrentPostTemplate(null)
    this.props.toggleHidePosts(false)
  }

  //takes postTemplates from all providers and accounts and organizes by channelType
  channelPostTemplates(postTemplates) {
   /* const postTemplatesArray = _.values(postTemplates)
    const channelPostTemplates = postTemplatesArray.filter((postTemplate) => (
      postTemplate.providerAccountId == this.props.currentAccount.id && postTemplate.channelType === this.props.currentChannel
    ))

    return channelPostTemplates*/
  }

  render() {
    //might use some of these props as a filter, to not show certain PostTemplates? but would probably want to do that in the picker?
    const {currentAccount, currentProvider, currentChannel, currentPostTemplate, planPostTemplates, dirty, mode} = this.props
    if (this.props.hide || !currentPostTemplate || !Object.keys(currentPostTemplate).length ) {
      return null
    }

    //use the currentPostTemplate id, but that object reflects the persisted postTemplate. So use the form data
    let currentPostTemplateParams = currentPostTemplate && planPostTemplates[currentPostTemplate.id]

    /*let channelPostTemplates = []
    if (currentAccount && currentChannel) {
      channelPostTemplates = this.channelPostTemplates(planPostTemplates) || []
    }
    //channel postTemplates besides the current postTemplate
    const otherPostTemplateWrapper = channelPostTemplates.filter((p) => !currentPostTemplate || p.id !== currentPostTemplate.id)
  */

    return (

        <div key={currentPostTemplate.id}>
          <PostEditor
            params={currentPostTemplateParams}
            mode={mode && "TODO not using this yet...maybe use a separate component, for basically just showing utms"}
            form="EditPlan"
            type="postTemplate"
            items="postTemplates"
            hasContent={false}
            saveAllPosts={this.saveAllPosts}
            togglePending={this.props.togglePending}
          />
          <Button style="inverted" disabled={!dirty} title={dirty ? "" : "No changes to undo"} onClick={this.undoChanges}>
            Undo Changes
          </Button>

          <Button disabled={this.props.pending} onClick={dirty ? this.props.saveAllPosts : this.done}>
            {dirty ? "Save changes" : "Done"}
          </Button>
          <div className={classes.popupWrapper}>
            <Button style="danger"  onClick={this.toggleDeleting.bind(this, true)} >Delete Post Template</Button>
            <ConfirmationPopup
              show={this.state.deleting}
              handleClickOutside={this.toggleDeleting.bind(this, false)}
              onConfirm={this.removePostTemplate}
              onCancel={this.toggleDeleting.bind(this, false)}
              pending={this.state.deletePending}
              dangerous={true}
              side="top"
            />
          </div>
        </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentPlan: state.currentPlan,
    currentPostTemplate: state.currentPostTemplate,
    user: state.user,
    planPostTemplates: Helpers.safeDataPath(state.forms, "EditPlan.postTemplates.params", {}),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload, provider) => dispatch({type: SET_CURRENT_MODAL, payload, options: {oneProviderOnly: provider}}),
    setCurrentPostTemplate: (payload) => dispatch({type: SET_CURRENT_POST_TEMPLATE, payload}),
    updatePostTemplateRequest: (payload) => {dispatch({type: UPDATE_POST_TEMPLATE_REQUEST, payload})},
    destroyPostTemplateRequest: (payload, cb) => dispatch({type: DESTROY_POST_TEMPLATE_REQUEST, payload, cb}),
  }
}

const ConnectedPostTemplateWrapper = connect(mapStateToProps, mapDispatchToProps)(PostTemplateWrapper)
export default ConnectedPostTemplateWrapper

