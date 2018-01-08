import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Input, Checkbox, Icon } from 'shared/components/elements'
import { DropImage, Popup } from 'shared/components/groups'
import {
  SET_CURRENT_POST,
} from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import { UTM_TYPES, URL_LENGTH } from 'constants/posts'
import {formActions, alertActions} from 'shared/actions'
import classes from './style.scss'
import DatePicker from 'react-datepicker'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class UtmForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }

    this.addVariable = this.addVariable.bind(this)
    this.toggleViewingUtmPopup = this.toggleViewingUtmPopup.bind(this)
    this.updateUtm = this.updateUtm.bind(this)
  }

  updateUtm(utmType, settingKey = false, value, e) {
    //set the param
    let params = Object.assign({}, this.props.params)

    //if this type is required if any other exists, and some other exists
    //TODO performance better if only check other values if this one is blank
    const required = utmType.requiredIfUtmsEnabled && Object.keys(params).some((key) => {
      const isActive = key !== utmType.type && key.includes("Utm") && params[key].active && params[key].active !== "false"
      return isActive
    })

    if (required && !value) {
      alertActions.newAlert({
        title: `${utmType.label} is required:`,
        message: "Please remove all other utms before removing this utm.",
        level: "DANGER",
      })

      return

    } else if (settingKey) {
      params[utmType.type].key = value

    } else {
      params[utmType.type].value = value
    }

    params.dirty = true
    //update the params form
    formActions.setParams(this.props.form, this.props.items, {[params.id]: params})
  }

  toggleUtm(utmType, checked, e) {
    //basically, source needs to exist if any other one exists
    const params = this.props.params
    const required = utmType.requiredIfUtmsEnabled && Object.keys(params).some((key) => {
      const isActive = key !== utmType.type && key.includes("Utm") && params[key].active && params[key].active !== "false"
      return isActive
    })

    if (required && !checked) {
      alertActions.newAlert({
        title: `${utmType.label} is required:`,
        message: "Please remove all other utms before removing source.",
        level: "DANGER",
      })


    } else {
      //update the params form
      let params = Object.assign({}, this.props.params)
      params[utmType.type].active = checked
      params.dirty = true

      formActions.setParams(this.props.form, this.props.items, {[params.id]: params})
    }
  }

  //adds a variable to the UTM
  addVariable(utmType) {
    //currently only adding campaign name
    const params = Object.assign({}, this.props.params)
    let currentValue = params[utmType.type].value
    let newValue = currentValue ? `${currentValue}-{{campaign.name}}` : "{{campaign.name}}"
    this.updateUtm(utmType, false, newValue)
  }

  //value should be string for that utm type, so only one shows at a time
  toggleViewingUtmPopup (value = "") {
    this.setState({viewingUtmPopup: value})
  }

  render() {
    const {params, currentCampaign, type, formOptions} = this.props
    if (!params) {return null} //shouldn't happen, but whatever

    let fullLinkPreview = ""
    if (this.props.hasContent) {
      fullLinkPreview += currentCampaign.contentUrl
    } else if (!this.props.hasContent) {
      fullLinkPreview += "https://www.your-link"
    }

    fullLinkPreview += "?"
    fullLinkPreview += Helpers.extractUtmString(params, currentCampaign)

    return (
      <Flexbox className={classes.utms} justify="flex-start" align="flex-start" direction="column">
        <h3>UTMs</h3>
        <div className={classes.linkPreview}>
          <div><strong>Full link Preview:&nbsp;</strong>{fullLinkPreview}</div>
        </div>

        {UTM_TYPES.map((utmType) => {
          //TODO want to extract for use with plan editor...if we have a plan editor
          const type = utmType.type
          const label = utmType.label
          const active = [true, "true"].includes(Helpers.safeDataPath(params, `${type}.active`, false))
          const value = Helpers.safeDataPath(params, `${type}.value`, "")
          const key = Helpers.safeDataPath(params, `${type}.key`, "")
          return (
            <div key={type} className={classes.utmField}>
              <div className={classes.utmCheckbox}>
                <Checkbox
                  value={active}
                  onChange={this.toggleUtm.bind(this, utmType)}
                  label={`${label.titleCase()} UTM`}
                />&nbsp;
              </div>
              {active && <div>
                <Input
                  placeholder={``}
                  onChange={this.updateUtm.bind(this, utmType, false)}
                  value={value}
                />
                {type === "customUtm" && <Input
                  placeholder={``}
                  onChange={this.updateUtm.bind(this, utmType, "settingKey")}
                  value={key}
                />}
                <div className={classes.popupWrapper}>
                  <Icon name="question-circle" className={classes.helpBtn} onClick={this.toggleViewingUtmPopup.bind(this, type)}/>
                  <Popup
                    side="top"
                    float="center"
                    handleClickOutside={this.toggleViewingUtmPopup.bind(this, false)}
                    show={this.state.viewingUtmPopup === type}
                    containerClass={classes.popupContainer}
                  >
                    <div className={classes.helpBox}>
                      <div className={classes.instructions}>
                        <div>These utms will be added to your content url and made into Google short link before posting.</div>
                        <div><strong>"{"{{campaign.name}}"}"</strong> will use the campaign name in the utm once the campaign gets published.</div>
                      </div>
                      <Button
                        onClick={this.addVariable.bind(this, utmType)}
                        style="inverted"
                        small={true}
                      >
                        Add {"{{campaign.name}}"} to {label} UTM
                      </Button>
                    </div>
                  </Popup>
                </div>
              </div>}
            </div>
          )
        })}
      </Flexbox>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentCampaign: state.currentCampaign, //just for hacky fix when just changed contentUrl for campaign...eventually, do it diffewrent
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
  }
}

const ConnectedUtmForm = connect(mapStateToProps, mapDispatchToProps)(UtmForm)
export default ConnectedUtmForm

