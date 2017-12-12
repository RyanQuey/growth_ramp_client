import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon } from 'shared/components/elements'
import { PostTemplateCard, PostTemplateEditor } from 'user/components/partials'
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
    const postAccount = Helpers.accountFromPost(currentPostTemplate)
    const channelTypeHasMultiple = Helpers.channelTypeHasMultiple(null, currentPostTemplate.provider, currentPostTemplate.channelType)

    return (

        <div key={currentPostTemplate.id}>
          <h2>{Helpers.providerFriendlyName(currentPostTemplate.provider)} {currentPostTemplate.channelType.titleCase()}</h2>
          {postAccount &&
            <div key={postAccount.id} >
              <img alt="(No profile picture on file)" src={postAccount.photoUrl}/>
              <h5>{postAccount.userName} ({postAccount.email || "No email on file"})</h5>
              {channelTypeHasMultiple && post.postingAs && <h5>(Posting as {post.postingAs.toLowerCase()})</h5>}
            </div>
          }

          {false && <div className={classes.disablePostTemplate}>
            <Checkbox
              value={postTemplate.active}
              onChange={this.disablePostTemplate}
            />&nbsp;Disable postTemplate
          </div>}

          <PostTemplateEditor
            postTemplate={currentPostTemplateParams}
            mode={mode}
          />
          <div className={classes.instructions}>
              <p>
                <h4>Instructions:</h4>Use campaign data in the utm once gets created from this plan by putting variables inside of double-curly braces (e.g., <strong>"{"{{your-variable}}"}"</strong>). Spaces and most other punctuation will become automatically converted into hyphens. Note that variables can only be used like this in plans, not campaigns.
              </p>
              <p>
                <h5>Available attributes:</h5>
                <br/>
                <Flexbox>
                  <Flexbox className={classes.leftColumn} direction="column">
                    <div>{"{{campaign.name}}"}</div>
                    <div>{"{{campaign.id}}"}</div>
                    {false && <div>{"{{platform.name}}"}</div>}
                    {false && <div>{"{{channel.type}}"}</div>}
                    {false && <div>{"{{channel.name}}"}</div>}
                  </Flexbox>
                  <Flexbox className={classes.rightColumn} direction="column">
                    <div>The name of the campaign</div>
                    <div>A unique id number Growth Ramp assigns to each of your campaigns</div>
                    {false && <div>The name of the social media platform (e.g., "Facebook" or "Twitter")</div>}
                    {false && <div>The type of channel the post is for (e.g., "Personal" or "Company-Page")</div>}
                    {false && <div>The name of the channel if applicable (e.g., "My-Favorite-Group"). Will be blank if personal post</div>}
                  </Flexbox>

                </Flexbox>
              </p>

          </div>
          <Button style="danger" onClick={this.removePostTemplate.bind(this, currentPostTemplate)}>Delete Post Template</Button>
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

