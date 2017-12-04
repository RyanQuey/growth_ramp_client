import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon } from 'shared/components/elements'
import { PostTemplateCard, PostTemplateDetails } from 'user/components/partials'
import { SET_CURRENT_MODAL, UPDATE_POST_TEMPLATE_REQUEST, SET_CURRENT_POST_TEMPLATE,  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class PostTemplateWrapper extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.channelPostTemplates = this.channelPostTemplates.bind(this)
    this.removePostTemplate = this.removePostTemplate.bind(this)
  }

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
    const {currentAccount, currentProvider, currentChannel, currentPostTemplate, planPostTemplates} = this.props
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
console.log(channelPostTemplates);*/
    const mode = this.props.mode

    return (

        <div key={currentPostTemplate.id}>
          <PostTemplateDetails
            postTemplate={currentPostTemplateParams}
            mode={mode}
          />
          <Button style="inverted" onClick={this.removePostTemplate.bind(this, currentPostTemplate)}>Destroy Post Template</Button>
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
  }
}

const ConnectedPostTemplateWrapper = connect(mapStateToProps, mapDispatchToProps)(PostTemplateWrapper)
export default ConnectedPostTemplateWrapper

