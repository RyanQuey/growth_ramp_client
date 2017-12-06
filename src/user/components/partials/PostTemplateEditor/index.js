import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Input, Checkbox, Icon } from 'shared/components/elements'
import { DropImage } from 'shared/components/groups'
import {
  SET_CURRENT_POST_TEMPLATE,
  LIVE_UPDATE_POST_TEMPLATE_REQUEST,
  LIVE_UPDATE_POST_TEMPLATE_SUCCESS,
  LIVE_UPDATE_POST_TEMPLATE_FAILURE,
} from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import { UTM_TYPES } from 'constants/posts'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//will edit and show details...so...
class PostTemplateDetails extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.handleText = this.handleText.bind(this)
  }

  updateUtm(utmType, settingKey = false, value, e) {
    //set the param
    let postTemplate = Object.assign({}, this.props.postTemplate)

    if (settingKey) {
      postTemplate[utmType].key = value

    } else {
      postTemplate[utmType].value = value
    }

    postTemplate.dirty = true
    //update the postTemplate form
    formActions.setParams("EditPlan", "postTemplates", {[postTemplate.id]: postTemplate})
  }

  toggleUtm(utmType, checked, e) {
    //update the postTemplate form
    let postTemplate = Object.assign({}, this.props.postTemplate)
    let utmFields = Object.assign({}, Helpers.safeDataPath(this.props.formOptions, `${this.props.postTemplate.id}.utms`, {}))

    utmFields[utmType].active = checked
    postTemplate.dirty = true

    //formActions.setOptions("EditPlan", "postTemplates", {[this.props.postTemplate.id]: {utms: utmFields}})
    formActions.setParams("EditPlan", "postTemplates", {[postTemplate.id]: postTemplate})
  }

  //TODO debounce
  handleText(value) {
    //set the param
    let postTemplate = Object.assign({}, this.props.postTemplate)
    postTemplate.text = value
    postTemplate.dirty = true

    //update the postTemplate form
    formActions.setParams("EditPlan", "postTemplates", {[postTemplate.id]: postTemplate})
  }

  render() {
    const postTemplate = this.props.postTemplate
    if (!postTemplate) {return null} //shouldn't happen, but whatever
    let utmFields = Object.assign({}, Helpers.safeDataPath(this.props.formOptions, `${postTemplate.id}.utms`, {}))
    const mode = this.props.mode

    return (
      <Flexbox direction="column" >
        <h2>{PROVIDERS[postTemplate.provider].name} {postTemplate.channelType.titleCase()}</h2>
        {false && <div className={classes.disablePostTemplate}>
          <Checkbox
            value={postTemplate.active}
            onChange={this.disablePostTemplate}
          />&nbsp;Disable postTemplate
        </div>}

        <div className={classes.postTemplateFields}>
          <div>
            <Flexbox flexWrap="wrap" className={classes.utms}>
              {UTM_TYPES.map((utmType) => {
                //TODO want to extract for use with plan editor...if we have a plan editor
                const type = utmType.type
                const label = utmType.label
                const active = Helpers.safeDataPath(postTemplate, `${type}.active`, false)
                const value = Helpers.safeDataPath(postTemplate, `${type}.value`, "")
                const key = Helpers.safeDataPath(postTemplate, `${type}.key`, "")
                return <div key={type} className={classes.utmField}>
                  {mode === "EDIT" ? (
                    <div>
                      <Checkbox
                        value={active}
                        onChange={this.toggleUtm.bind(this, type)}
                        label={`${label.titleCase()} UTM`}
                      />&nbsp;

                      {active && <Input
                        placeholder={`${label.titleCase()} utm for this template`}
                        onChange={this.updateUtm.bind(this, type, false)}
                        value={value}
                      />}
                      {active && type === "customUtm" && <Input
                        placeholder={`Key for this utm`}
                        onChange={this.updateUtm.bind(this, type, "settingKey")}
                        value={key}
                      />}
                    </div>
                  ) : (
                    <div>
                      <label>{label.titleCase()} UTM:</label>&nbsp;
                      <span>{Helpers.safeDataPath(postTemplate, `${type}.value`, "None")}</span>
                    </div>
                  )}
                </div>
              })}

              <p>
                <strong>Instructions:</strong>&nbsp; Use campaign data in the utm once gets created from this plan by putting variables inside of double-curly braces (e.g., "{"{{your-variable}}"}"). Spaces and most other punctuation will become automatically converted into hyphens. Note that variables can only be used like this in plans, not campaigns.
              </p>
              <p>
                <strong>Available attributes:</strong>&nbsp;
                <Flexbox>
                  <Flexbox direction="column">
                    <div>{"{{campaign.name}}"}</div>
                    <div>{"{{campaign.id}}"}</div>
                    <div>{"{{platform.name}}"}</div>
                    <div>{"{{channel.type}}"}</div>
                    <div>{"{{channel.name}}"}</div>
                  </Flexbox>
                  <Flexbox direction="column">
                    <div>The name of the campaign</div>
                    <div>A unique id number Growth Ramp assigns to each of your campaigns</div>
                    <div>The name of the social media platform (e.g., "Facebook" or "Twitter")</div>
                    <div>The type of channel the post is for (e.g., "Personal" or "Company-Page")</div>
                    <div>The name of the channel if applicable (e.g., "My-Favorite-Group"). Will be blank if personal post</div>
                  </Flexbox>

                </Flexbox>
              </p>
            </Flexbox>

          </div>
        </div>
      </Flexbox>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    uploadedFiles: Helpers.safeDataPath(state.forms, "EditPlan.uploadedFiles", []),
    formOptions: Helpers.safeDataPath(state.forms, "EditPlan.postTemplates.options", {}),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
  }
}

const ConnectedPostTemplateDetails = connect(mapStateToProps, mapDispatchToProps)(PostTemplateDetails)
export default ConnectedPostTemplateDetails

