import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Input, Checkbox, Icon } from 'shared/components/elements'
import { DropImage } from 'shared/components/groups'
import {
  SET_CURRENT_POST,
  LIVE_UPDATE_POST_REQUEST,
  LIVE_UPDATE_POST_SUCCESS,
  LIVE_UPDATE_POST_FAILURE,
} from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import { UTM_TYPES, URL_LENGTH } from 'constants/posts'
import {formActions, alertActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class PostEditor extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.addVariable = this.addVariable.bind(this)
    this.handleContentText = this.handleContentText.bind(this)
    this.onDrop = this.onDrop.bind(this)
    //this.onOverrideDrop = this.onOverrideDrop.bind(this)
    this.removeUpload = this.removeUpload.bind(this)
    this.onUpload = this.onUpload.bind(this)
  }

  updateUtm(utmType, settingKey = false, value, e) {
    //set the param
    let record = Object.assign({}, this.props.record)
    //if this type is required if any other exists, and some other exists
    //TODO performance better if only check other values if this one is blank
    const required = utmType.requiredIfUtmsEnabled && Object.keys(record).some((key) => {
      const isActive = key !== utmType.type && key.includes("Utm") && record[key].active && record[key].active !== "false"
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
      record[utmType.type].key = value

    } else {
      record[utmType.type].value = value
    }

    record.dirty = true
    //update the record form
    formActions.setParams(this.props.form, this.props.items, {[record.id]: record})
  }

  toggleUtm(utmType, checked, e) {
    //basically, source needs to exist if any other one exists
    const record = this.props.record
    const required = utmType.requiredIfUtmsEnabled && Object.keys(record).some((key) => {
      const isActive = key !== utmType.type && key.includes("Utm") && record[key].active && record[key].active !== "false"
      return isActive
    })

    if (required && !checked) {
      alertActions.newAlert({
        title: `${utmType.label} is required:`,
        message: "Please remove all other utms before removing source.",
        level: "DANGER",
      })


    } else {
      //update the record form
      let record = Object.assign({}, this.props.record)
      record[utmType.type].active = checked
      record.dirty = true

      formActions.setParams(this.props.form, this.props.items, {[record.id]: record})
    }
  }

  //adds a variable to the UTM
  addVariable(utmType) {
    //currently only adding campaign name
    const record = Object.assign({}, this.props.record)
    let currentValue = record[utmType.type].value
    let newValue = currentValue ? `${currentValue}-{{campaign.name}}` : "{{campaign.name}}"
    this.updateUtm(utmType, false, newValue)
  }

  //TODO debounce
  handleContentText(value) {
    //set the param
    let record = Object.assign({}, this.props.record)
    record.text = value
    record.dirty = true

    const maxCharacters = PROVIDERS[record.provider].channelTypes[record.channelType].maxCharacters
    const characterCount = Helpers.safeDataPath(record, "text", "").length + (record.contentUrl ? URL_LENGTH : 0)

    if (characterCount.length > maxCharacters) {
      alertActions.newAlert({
        title: "Warning:",
        message: "Character limit reached",
        level: "WARNING",
      })

    } else {
      //update the record form
      formActions.setParams(this.props.form, this.props.items, {[record.id]: record})
    }
  }

  //NOTE: cannot save a file object in redux, at least not in a easy way.
  //Just upload here
  onDrop(acceptedFile, rejectedFile) {
    if (acceptedFile) {
      this.props.togglePending(true)
    } else {
      console.log("failed to drop file");
    }
  }

  removeUpload(oldFileUrl){
    //TODO also remove from b2
    //let uploadedFiles = [...this.props.uploadedFiles]
    //_.remove(uploadedFiles, (f) => f === oldFileUrl)

    //formActions.setParams(this.props.form, "uploadedFiles", uploadedFiles)

    //update the record form
    let record = Object.assign({}, this.props.record)
    _.remove(record.uploadedContent, (c) => c.url === oldFileUrl)
    record.dirty = true
    formActions.setParams(this.props.form, this.props.items, {[record.id]: record})
//console.log(record);
  }

  //not using
  /*onOverrideDrop(oldFileUrl, acceptedFile, rejectedFile) {
    //remove the old file
    this.removeUpload(oldFileUrl)

    if (acceptedFile) {
      this.props.togglePending(true)
    } else {
      console.log("failed to drop file");
    }
  }*/

  onUpload(result) {
    this.props.togglePending(false)
    //is successful, a url
    if (typeof result === "string") {
      const fileUrl = result
      //update the uploadedFiles list...which I could use to clear out unused files
      //let uploadedFiles = [...this.props.uploadedFiles]
      //uploadedFiles.push(fileUrl)

      //formActions.setParams(this.props.form, "uploadedFiles", uploadedFiles)

      //update the record form
      let record = Object.assign({}, this.props.record)
      if (!record.uploadedContent) {
        record.uploadedContent = []
      }
      record.uploadedContent.push({url: fileUrl, type: "IMAGE"})
      record.dirty = true

      formActions.setParams(this.props.form, this.props.items, {[record.id]: record})
    }
  }

  render() {
    const record = this.props.record
    if (!record) {return null} //shouldn't happen, but whatever
    let utmFields = Object.assign({}, Helpers.safeDataPath(this.props.formOptions, `${record.id}.utms`, {}))

    const maxImages = PROVIDERS[record.provider].channelTypes[record.channelType].maxImages
    const imageCount = record.uploadedContent ? record.uploadedContent.length : 0

    const maxCharacters = PROVIDERS[record.provider].channelTypes[record.channelType].maxCharacters
    const characterCount = Helpers.safeDataPath(record, "text", "").length + (record.contentUrl ? URL_LENGTH : 0)
    const account = Helpers.accountFromPost(record)
    const channelTypeHasMultiple = Helpers.channelTypeHasMultiple(null, record.provider, record.channelType)
    const type = this.props.type

    let warningMessage
    if (record.provider === "LINKEDIN" && !record.contentUrl && record.uploadedContent && record.uploadedContent.length) {
      warningMessage = "WARNING: Growth Ramp allows but does not recommend posting to LinkedIn with an image but without a link. Due to a flaw in LinkedIn's system, the posts will be displayed in an irregular way. We are currently working with LinkedIn to find a solution. In the meantime, please add a link to your blog for the post to be displayed normally"
    }

    return (
      <Flexbox direction="column" className={classes.recordFields}>
          <h2>{Helpers.providerFriendlyName(record.provider)} {record.channelType.titleCase()}{type === "postTemplate" ? " Template" : ""}</h2>
          {account &&
            <div key={account.id} >
              {account.photoUrl ? <img src={account.photoUrl}/> : <div>(No profile picture on file)</div>}
              <h5>{account.userName} ({account.email || "No email on file"})</h5>
              {channelTypeHasMultiple && record.postingAs && <h5>(Posting as {record.postingAs.toLowerCase()})</h5>}
            </div>
          }

          {this.props.hasContent && <Flexbox direction="column" justify="center" className={classes.textEditor}>
            <div>Maximum: {maxCharacters};&nbsp;Current Count: {characterCount} {record.contentUrl ? `(including ${URL_LENGTH} for the url length)` : ""}</div>
            <Input
              textarea={true}
              value={record.text || ""}
              placeholder={`Your message`}
              onChange={this.handleContentText}
              type="text"
              maxLength={maxCharacters - URL_LENGTH}
            />
            {warningMessage && <div className={classes.warningMessage}>{warningMessage}</div>}
            {imageCount > maxImages && <label>(No more images allowed for this kind of post)</label>}
            <Flexbox>
              {imageCount < maxImages && <DropImage
                user={this.props.user}
                label="Upload an image"
                onStart={this.onDrop}
                onSuccess={this.onUpload}
                onFailure={this.onUpload}
                className={classes.dropImage}
              />}
              {record.uploadedContent && record.uploadedContent.map((upload) => {
                return <Flexbox key={upload.url} direction="column">
                  <a
                    target="_blank"
                    style={{backgroundImage: `url(${upload.url})`}}
                    className={classes.dropImage}
                    href={upload.url}
                  />
                  <Icon name="close" onClick={this.removeUpload.bind(this, upload.url)} />
                </Flexbox>
              })}
            </Flexbox>
          </Flexbox>}
          <Flexbox className={classes.utms} justify="flex-start" align="flex-start" direction="column">
            {this.props.hasContent && !record.contentUrl ? (
              <div>(Utms cannot be set when there is no content URL)</div>
            ) : (
              UTM_TYPES.map((utmType) => {
                //TODO want to extract for use with plan editor...if we have a plan editor
                const type = utmType.type
                const label = utmType.label
                const active = [true, "true"].includes(Helpers.safeDataPath(record, `${type}.active`, false))
                const value = Helpers.safeDataPath(record, `${type}.value`, "")
                const key = Helpers.safeDataPath(record, `${type}.key`, "")
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
                      <Button
                        onClick={this.addVariable.bind(this, utmType)}
                        style="inverted"
                        small={true}
                      >
                        Add Campaign Name to UTM
                      </Button>
                    </div>}
                  </div>
                )
              })
            )}
            {this.props.hasContent && record.contentUrl && (
              <div className={classes.instructions}>
                <p>
                  <h4>Instructions:</h4><strong>"{"{{campaign.name}}"}"</strong> will use the campaign name in the utm once the campaign gets published.
                </p>

                {false && <p>
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
                </p>}
              </div>
            )}
        </Flexbox>

      </Flexbox>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
  }
}

const ConnectedPostEditor = connect(mapStateToProps, mapDispatchToProps)(PostEditor)
export default ConnectedPostEditor

