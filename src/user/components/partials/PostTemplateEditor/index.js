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
    this.addVariable = this.addVariable.bind(this)
  }

  updateUtm(utmType, settingKey = false, value, e) {
    //set the param
    let postTemplate = Object.assign({}, this.props.postTemplate)
//TODO test
    const required = utmType.requiredIfUtmsEnabled && Object.keys(postTemplate).some((key) => {
      const isActive = key !== utmType.type && key.includes("Utm") && postTemplate[key].active && postTemplate[key].active !== "false"
      return isActive
    })

    if (required && !checked) {
      alertActions.newAlert({
        title: `${utmType.label} is required:`,
        message: "Please remove all other utms before removing source.",
        level: "DANGER",
      })


    } else {


      if (settingKey) {
        postTemplate[utmType].key = value

      } else {
        postTemplate[utmType].value = value
      }

      postTemplate.dirty = true
      //update the postTemplate form
      formActions.setParams("EditPlan", "postTemplates", {[postTemplate.id]: postTemplate})
    }
  }

  toggleUtm(utmType, checked, e) {
    //update the postTemplate form
    let postTemplate = Object.assign({}, this.props.postTemplate)
//TODO test
    const required = utmType.requiredIfUtmsEnabled && Object.keys(postTemplate).some((key) => {
      const isActive = key !== utmType.type && key.includes("Utm") && postTemplate[key].active && postTemplate[key].active !== "false"
      return isActive
    })

    if (required && !checked) {
      alertActions.newAlert({
        title: `${utmType.label} is required:`,
        message: "Please remove all other utms before removing source.",
        level: "DANGER",
      })


    } else {

      postTemplate.dirty = true
      postTemplate[utmType].active = checked

      //formActions.setOptions("EditPlan", "postTemplates", {[this.props.postTemplate.id]: {utms: utmFields}})
      formActions.setParams("EditPlan", "postTemplates", {[postTemplate.id]: postTemplate})
    }
  }

  addVariable(utmType) {
    //currently only adding campaign name
    const postTemplate = Object.assign({}, this.props.postTemplate)
    let currentValue = postTemplate[utmType].value
    let newValue = currentValue ? `${currentValue}-{{campaign.name}}` : "{{campaign.name}}"
    this.updateUtm(utmType, false, newValue)
  }

  //TODO debounce
  handleText(value) {
    //set the param
//TODO require the source thing
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
        <div className={classes.postTemplateFields}>
          <Flexbox flexWrap="wrap" className={classes.utms}>
            {UTM_TYPES.map((utmType) => {
              //TODO want to extract for use with plan editor...if we have a plan editor
              const type = utmType.type
              const label = utmType.label
              const active = [true, "true"].includes(Helpers.safeDataPath(postTemplate, `${type}.active`, false))
              const value = Helpers.safeDataPath(postTemplate, `${type}.value`, "")
              const key = Helpers.safeDataPath(postTemplate, `${type}.key`, "")
console.log(active);
              return <div key={type} className={classes.utmField}>
                {mode === "EDIT" ? (
                  <div>
                    <div className={classes.utmCheckbox}>
                      <Checkbox
                        value={active}
                        onChange={this.toggleUtm.bind(this, type)}
                        label={`${label.titleCase()} UTM`}
                      />&nbsp;
                    </div>

                    {active && <div>
                      <Input
                        placeholder={``}
                        onChange={this.updateUtm.bind(this, type, false)}
                        value={value}
                      />
                      {type === "customUtm" && <Input
                        placeholder={``}
                        onChange={this.updateUtm.bind(this, type, "settingKey")}
                        value={key}
                      />}
                      <Button
                        onClick={this.addVariable.bind(this, type, false)}
                        style="inverted"
                        small={true}
                      >
                        Add Campaign name to UTM
                      </Button>

                    </div>}
                  </div>
                ) : (
                  <div>
                    <label>{label.titleCase()} UTM:</label>&nbsp;
                    <span>{Helpers.safeDataPath(postTemplate, `${type}.value`, "None")}</span>
                  </div>
                )}
              </div>
            })}
          </Flexbox>
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

