import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon, Card } from 'shared/components/elements'
import { PostTemplateCard, ProviderCard } from 'user/components/partials'
import { SET_CURRENT_POST_TEMPLATE, SET_CURRENT_MODAL, UPDATE_PLAN_REQUEST  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import {UTM_TYPES} from 'constants/posts'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in Compose only
class PostTemplatePicker extends Component {
  constructor() {
    super()

    this.state = {
      currentPostTemplate: null, //will be an index
    }

    //this.removePostTemplate = this.removePostTemplate.bind(this)
    this.sortPostTemplatesByProvider = this.sortPostTemplatesByProvider.bind(this)
    this.setCurrentPostTemplate = this.setCurrentPostTemplate.bind(this)
  }

  /*removePostTemplate(postTemplate, index) {
    if (this.state.currentPostTemplate === index) {
      this.setState({currentPostTemplate: null})
    }

    const plan = Object.assign({}, this.props.currentPlan)
    const channelTemplates = Helpers.safeDataPath(plan, `channelConfigurations.${this.props.account.provider}.postTemplates`, [])

    this.props.updatePostTemplateRequest(plan)
    this.props.setCurrentPostTemplate(null)
  }*/

  //takes postTemplates from all channels and accounts and organizes by provider
  sortPostTemplatesByProvider(postTemplates) {
    const postTemplatesArray = _.values(postTemplates)
    const sorted = {}
    const providers = Object.keys(this.props.providerAccounts)

    for (let i = 0; i < providers.length; i++) {
      let provider = providers[i]
      let accountsIdsForProvider = this.props.providerAccounts[provider].map((a) => a.id)

      sorted[provider] = []

      //iterate backwards so indices work
      for (let i = postTemplatesArray.length -1; i > -1; i--) {
        let postTemplate = postTemplatesArray[i]
        if (accountsIdsForProvider.includes(postTemplate.providerAccountId)) {
          sorted[provider].push(postTemplate)
          //so don't have to iterate over again
          postTemplatesArray.splice(i, 1)
        }
      }
    }

    return sorted
  }

  setCurrentPostTemplate(postTemplate) {
    //turn off adding a postTemplate when click on a card
    this.props.toggleAdding(false, false)
console.log("now setting",postTemplate);
    this.props.setCurrentPostTemplate(postTemplate)

    //make sure utms are enabled if postTemplate has those utms
    let utmKeys = UTM_TYPES.map((t) => t.value)
    let utmFields = {}
    for (let i = 0; i < utmKeys.length; i++) {
      let key = utmKeys[i]
      utmFields[key] = postTemplate[key] ? true : false
    }

    formActions.setOptions("EditPlan", "postTemplates", {[postTemplate.id]: {utms: utmFields}})
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const sortedPostTemplates = this.sortPostTemplatesByProvider(this.props.planPostTemplates || [])
    const providers = Object.keys(sortedPostTemplates)
    const mode = this.props.mode

    return (
      <div >
        <h3>Your Post Templates:</h3>
        {!Object.keys(sortedPostTemplates).length && <div>No post templates yet</div>}

        <Flexbox className={classes.postTemplateMenu}>
          {providers.map((provider) => {
            let providerPostTemplates = sortedPostTemplates[provider]
            return (
              <Flexbox key={provider} className={classes.providerColumn} direction="column" >
                <h3>{PROVIDERS[provider].name}</h3>

                {providerPostTemplates.map((postTemplate) =>
                  <PostTemplateCard
                    key={postTemplate.id}
                    className={`
                      ${classes.postTemplateCard}
                      ${postTemplate.dirty ? classes.dirty : ""}
                      ${postTemplate.toDelete ? classes.toDelete : ""}
                      ${typeof postTemplate.id === "string" ? classes.toCreate : ""}
                    `}
                    postTemplate={postTemplate}
                    height="110px"
                    maxWidth="220px"
                    onClick={this.setCurrentPostTemplate.bind(this, postTemplate)}
                    selected={this.props.currentPostTemplate && this.props.currentPostTemplate.id === postTemplate.id}
                  />
                )}

                {mode === "EDIT" && <Card
                  onClick={this.props.toggleAdding.bind(this, provider)}
                  height="110px"
                  maxWidth="220px"
                  className={classes.postTemplateCard}
                >
                  Add a new post template
                </Card>}

                {mode === "SHOW" && providerPostTemplates.length === 0 && (
                  <div>No post templates so far</div>
                )}
              </Flexbox>
            )

          })}
        </Flexbox>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    //really is plan postTemplates params
    planPostTemplates: Helpers.safeDataPath(state.forms, "EditPlan.postTemplates.params", {}),
    user: state.user,
    providerAccounts: state.providerAccounts,
    currentPostTemplate: state.currentPostTemplate,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    setCurrentPostTemplate: (payload, options) => dispatch({type: SET_CURRENT_POST_TEMPLATE, payload, options}),
    updatePlanRequest: (payload) => {dispatch({type: UPDATE_PLAN_REQUEST, payload})},
  }
}

const ConnectedPostTemplatePicker = connect(mapStateToProps, mapDispatchToProps)(PostTemplatePicker)
export default ConnectedPostTemplatePicker

