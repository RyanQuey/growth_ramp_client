import { Component } from 'react';
import { connect } from 'react-redux'
import { withRouter, Prompt } from 'react-router-dom'
import {
  //PostTemplateEditor,
  AddPost, //shared with the CampaignEditor
  PostPicker,
  PostTemplateEditorWrapper
} from 'user/components/partials'
import { Navbar, Icon, Button, Input, Flexbox } from 'shared/components/elements'
import {
  FETCH_CURRENT_PLAN_REQUEST,
  SET_CURRENT_PLAN,
  CREATE_PLAN_REQUEST,
  UPDATE_PLAN_REQUEST,
  CREATE_POST_TEMPLATE_REQUEST,
  UPDATE_POST_TEMPLATE_REQUEST,
  SET_CURRENT_POST_TEMPLATE,
  DESTROY_POST_TEMPLATE_REQUEST,
  SET_CURRENT_MODAL,
} from 'constants/actionTypes'
import {UTM_TYPES} from 'constants/posts'
import theme from 'theme'
import { formActions, alertActions } from 'shared/actions'
import classes from './style.scss'

class ShowPlan extends Component {
  constructor() {
    super()
    this.state = {
      addingPostTemplate: false,
      hidePosts: false,
      name: "",
    }

    this.handleLinkProvider = this.handleLinkProvider.bind(this)
    this.savePlanName = this.savePlanName.bind(this)
    this.savePostTemplates = this.savePostTemplates.bind(this)
    this.toggleAdding = this.toggleAdding.bind(this)
    this.toggleHidePosts = this.toggleHidePosts.bind(this)
    this.togglePending = this.togglePending.bind(this)
    //this.toggleMode = this.toggleMode.bind(this)
    this.setPlan = this.setPlan.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
    this.handleUnload = this.handleUnload.bind(this)
    this.addFakeProvider = this.addFakeProvider.bind(this)
  }

  componentDidMount() {
    //set current plan based on the url params, no matter what it was before
    const planId = this.props.match.params.planId
    this.setPlan(planId)
    window.onbeforeunload = this.handleUnload//TODO maybe use window.addEventListener("beforeunload") instead. Make sure to do for plans and campaign
  }

  componentWillUnmount () {
    window.onbeforeunload = null
  }

  addFakeProvider (e) {
    e.preventDefault()
    this.props.setCurrentModal("AddFakeProviderAccountModal")
  }

  handleUnload(e) {
    if (this.props.dirty) {
      var dialogText = 'Form not saved; Are you sure you want to leave?';//doesn't seem to show in Chrome at least
      e.returnValue = dialogText;
      return dialogText;
    }
  }

  componentWillReceiveProps (props) {
    if (props.match.params.planId !== this.props.match.params.planId) {
      //editing a new plan, without remounting.
      //this would happen if click "New Plan" while editing a different one
      this.setPlan(props.match.params.planId)

    }
  }

  setPlan (planId) {
    const currentPlan = this.props.plans[planId]
    //check if need to retrieve and/or populate postTemplates
    if (!currentPlan || !currentPlan.postTemplatess) {
      const cb = () => {
        this.togglePending(false)
        formActions.matchPlanStateToRecord()
      }

      //this action doesn't yet support any criteria
      this.togglePending(true)

      this.props.fetchCurrentPlan(planId, cb)
      //initializing to match persisted record
      formActions.matchPlanStateToRecord()

    } else {
      this.props.setCurrentPlan(currentPlan)
      //initializing to match persisted record
      formActions.matchPlanStateToRecord()
    }

  }

  handleChangeName (value, e, errors) {
    formActions.setParams("EditPlan", "other", {name: value})
    //this.setState({name: value})
  }

  openNewProviderModal(provider) {
    //provider will be the only provider they add an account for
    this.props.setCurrentModal("LinkProviderAccountModal", {provider})
  }

  // not using toggle mode right now; will probablywant again later
  /*toggleMode() {
    const mode = Helpers.safeDataPath(this.props, "match.params.editing", false) ? "EDIT" : "SHOW"

    if (mode === "EDIT") {
      formActions.setParams("EditPlan", "other", this.props.currentPlan)
      this.props.history.push(`/plans/${this.props.currentPlan.id}`)

    } else {
      formActions.matchPlanStateToRecord()
      this.props.history.push(`/plans/${this.props.currentPlan.id}/edit`)
    }
  }*/

  toggleHidePosts (value, e) {
    e && e.preventDefault()
    this.setState({
      hidePosts: value,
    })
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  toggleAdding(provider, value = !this.state.addingPostTemplate, currentPostTemplate = null) {
    //if provider is passed in, just starts making a postTemplate for that provider
    this.props.setCurrentPostTemplate(currentPostTemplate)
    this.setState({addingPostTemplate: provider || value})
    this.toggleHidePosts(provider || value)
  }

  savePostTemplates() {
    const planPostTemplatesFormArray = _.values(this.props.planPostTemplatesForm.params)
    const persistedPostTemplates = this.props.currentPlan.postTemplates || []

    const cb = () => {
      formActions.matchPlanStateToRecord()
      this.props.setCurrentPostTemplate(null)
      this.toggleHidePosts(false) //should already be not hidden, but whatever
    }

    //should not update the postTemplate reducer on its success, just give me an alert if it fails

    //check if need to update or create each postTemplate
    for (let i = 0; i < planPostTemplatesFormArray.length; i++) {
      let postTemplate = Object.assign({}, planPostTemplatesFormArray[i])
      let utmFields = UTM_TYPES.map((t) => t.type)

      // TO DESTROY
      if (postTemplate.toDelete) {
        //if not persisted yet, don't need to save anything
        if (typeof postTemplate.id === "string") {
          cb()
          continue

        } else {
          this.props.destroyPostTemplateRequest(postTemplate, cb)
        }

      // TO CREATE
      } else if (typeof postTemplate.id === "string") { //.slice(0, 9) === "not-saved") {
        delete postTemplate.id
        this.props.createPostTemplateRequest(postTemplate, cb)
        continue

      // TO UPDATE
      } else {
        //iterate over postTemplate attributes, to sort params
        if (!postTemplate.dirty) {
          //no need to update
          continue
        }
        delete postTemplate.dirty

        //should never really be {}...but whatever
        let persistedPostTemplate = persistedPostTemplates.find((p) => p.id === postTemplate.id) || {}

        this.props.updatePostTemplateRequest(postTemplate, cb)
      }
    }
  }

  savePlanName() {
    //save plan metadata
    let planParams = this.props.planParams
    //let name = this.state.name
    const persistedRecord = this.props.currentPlan
    if (!planParams.name) {
      alertActions.newAlert({
        title: "Failed to save:",
        message: "Name is required",
        level: "DANGER",
      })
      return
    }

    //save the templates after updating the plan. Unless plan doesn't need to be updated at all
    const done = () => {
      this.togglePending(false)
      formActions.matchPlanStateToRecord()
    }

    const options = {} //can't remember why i have this..maybe just that, I coudl use if needed?
    const params = {
      id: persistedRecord.id,
      name: planParams.name, //only thing I'm saving so far
      userId: persistedRecord.userId,
    }

    this.props.updatePlanRequest(params, options, done)
  }

  handleLinkProvider() {
    this.props.setCurrentModal("LinkProviderAccountModal")
  }

  render() {
    const c = this;
    const {currentPlan, planParams, planPostTemplatesForm} = this.props
    const mode = Helpers.safeDataPath(this.props, "match.params.editing", false) ? "EDIT" : "SHOW"
    const dirty = this.props.dirty

    return (
      currentPlan ? (
        <div>
          <Prompt when={dirty} message={(location) => 'Form not saved; Are you sure you want to leave?'}/>
          {mode === "SHOW" ? (
            <h1>{currentPlan.name}</h1>
          ) : (
            <Input
              value={planParams.name}
              placeholder="Plan Name"
              onChange={this.handleChangeName}
              className={classes.nameInput}
            />
          )}
          <Button style="inverted" disabled={planParams.name === currentPlan.name} onClick={this.savePlanName}>
            {planParams.name !== currentPlan.name ? "Save name" : "Name is up to date"}
          </Button>

          <div className={classes.fakePlatformBox}>
            <a onClick={this.addFakeProvider}>Promoting in a channel Growth Ramp doesn't post to? Click here to build a link for that channel too</a>
          </div>
          <div>
            <PostPicker
              toggleAdding={this.toggleAdding}
              addingPost={this.state.addingPostTemplate}
              mode={mode}
              toggleHidePosts={this.toggleHidePosts}
              hidden={this.state.hidePosts}
              form="EditPlan"
              items="postTemplates"
              postsParams={this.props.planPostTemplatesForm.params}
              currentPost={this.props.currentPostTemplate}
            />

            {(this.state.addingPost || this.props.currentPostTemplate || this.state.hidePosts) && <a href="#" onClick={this.toggleHidePosts.bind(this, !this.state.hidePosts)}>{this.state.hidePosts ? "Show" : "Hide"} Current Post Templates</a>}
          </div>

          {this.state.addingPostTemplate ? (
            <AddPost
              toggleAdding={this.toggleAdding}
              type="postTemplate"
              currentProvider={this.state.addingPostTemplate}
              toggleHidePosts={this.toggleHidePosts}
            />
          ) : (
            <div>
              <hr/>
              <PostTemplateEditorWrapper
                mode={mode}
                toggleHidePosts={this.toggleHidePosts}
                saveAllPosts={this.savePostTemplates}
                dirty={dirty}
                togglePending={this.props.togglePending}
                pending={this.state.pending}
              />
            </div>
          )}
        </div>
      ) : (
        <Icon name="spinner" size="5x"/>
      )
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    plans: state.plans,
    currentPlan: state.currentPlan,
    currentPostTemplate: state.currentPostTemplate,
    //if either form is dirty
    planPostTemplatesForm: Helpers.safeDataPath(state.forms, "EditPlan.postTemplates", {}),
    formOptions: Helpers.safeDataPath(state.forms, "EditPlan.postTemplates.options", {}),
    planParams: Helpers.safeDataPath(state.forms, "EditPlan.other.params", {}),
    dirty: Helpers.safeDataPath(state.forms, "EditPlan.postTemplates.dirty", false) || Helpers.safeDataPath(state.forms, "EditPlan.other.dirty", false) ,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //createPlanRequest: (data) => dispatch({type: CREATE_PLAN_REQUEST, payload: data}),
    fetchCurrentPlan: (data, cb) => dispatch({type: FETCH_CURRENT_PLAN_REQUEST, payload: data, cb}),
    setCurrentPlan: (data) => dispatch({type: SET_CURRENT_PLAN, payload: data}),
    createPostTemplateRequest: (payload, cb) => {dispatch({type: CREATE_POST_TEMPLATE_REQUEST, payload, cb})},
    updatePlanRequest: (payload, options, cb) => {dispatch({type: UPDATE_PLAN_REQUEST, payload, options, cb})},
    updatePostTemplateRequest: (payload, cb) => {dispatch({type: UPDATE_POST_TEMPLATE_REQUEST, payload, cb})},
    setCurrentPostTemplate: (data) => dispatch({type: SET_CURRENT_POST_TEMPLATE, payload: data}),
    setCurrentModal: (payload, modalOptions) => dispatch({type: SET_CURRENT_MODAL, payload, options: modalOptions}),
    destroyPostTemplateRequest: (payload) => dispatch({type: DESTROY_POST_TEMPLATE_REQUEST, payload}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ShowPlan))


