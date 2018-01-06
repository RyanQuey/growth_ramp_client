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
import DatePicker from 'react-datepicker'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class PostEditor extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showCalendar: false,
      delayingPost: this.props.params.delayedUntil //will use as boolean though
    }

    this.addVariable = this.addVariable.bind(this)
    this.handleContentText = this.handleContentText.bind(this)
    this.onDrop = this.onDrop.bind(this)
    //this.onOverrideDrop = this.onOverrideDrop.bind(this)
    this.removeUpload = this.removeUpload.bind(this)
    this.onUpload = this.onUpload.bind(this)
    //this.toggleDelayCalendar = this.toggleDelayCalendar.bind(this)
    this.toggleDelayPost = this.toggleDelayPost.bind(this)
    this.handlePostTime = this.handlePostTime.bind(this)
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

  //TODO debounce
  handleContentText(value) {
    //set the param
    let params = Object.assign({}, this.props.params)
    params.text = value
    params.dirty = true

    const maxCharacters = PROVIDERS[params.provider].channelTypes[params.channelType].maxCharacters
    const characterCount = Helpers.safeDataPath(params, "text", "").length + (params.contentUrl ? URL_LENGTH : 0)

    if (characterCount.length > maxCharacters) {
      alertActions.newAlert({
        title: "Warning:",
        message: "Character limit reached",
        level: "WARNING",
      })

    } else {
      //update the params form for this post/posttemplate
      formActions.setParams(this.props.form, this.props.items, {[params.id]: params})
    }
  }

  //NOT USING  YET
  toggleDelayCalendar(value = !this.state.showCalendar) {
    this.setState({showCalendar: value})
  }

  toggleDelayPost(value, e) {
    this.setState({delayingPost: value})
console.log(value, e);
    if (!value) {
      //set to not delay
      let params = this.props.params
      params.delayedUntil = null
      params.dirty = true //so marked as needing to be saved

      formActions.setParams(this.props.form, this.props.items, {[params.id]: params})
    }
  }

  handlePostTime(dateTime) {
    let params = Object.assign({}, this.props.params)
    params.delayedUntil = dateTime.format()
    params.dirty = true //so marked as needing to be saved

    //to pass into the DatePicker to show selected time; purely cosmetic
    this.setState({selectedDateTime: dateTime})

    formActions.setParams(this.props.form, this.props.items, {[params.id]: params})

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

    //update the params form
    let params = Object.assign({}, this.props.params)
    _.remove(params.uploadedContent, (c) => c.url === oldFileUrl)
    params.dirty = true
    formActions.setParams(this.props.form, this.props.items, {[params.id]: params})
//console.log(params);
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

      //update the params form
      let params = Object.assign({}, this.props.params)
      if (!params.uploadedContent) {
        params.uploadedContent = []
      }
      params.uploadedContent.push({url: fileUrl, type: "IMAGE"})
      params.dirty = true

      formActions.setParams(this.props.form, this.props.items, {[params.id]: params})
    }
  }

  render() {
    const {params, currentCampaign, type, formOptions} = this.props
console.log(this.state.delayingPost);
    if (!params) {return null} //shouldn't happen, but whatever
    let utmFields = Object.assign({}, Helpers.safeDataPath(formOptions, `${params.id}.utms`, {}))

    const maxImages = PROVIDERS[params.provider].channelTypes[params.channelType].maxImages
    const imageCount = params.uploadedContent ? params.uploadedContent.length : 0

    const maxCharacters = PROVIDERS[params.provider].channelTypes[params.channelType].maxCharacters
    const characterCount = Helpers.safeDataPath(params, "text", "").length + (params.contentUrl ? URL_LENGTH : 0)
    const account = Helpers.accountFromPost(params)
    const channelTypeHasMultiple = Helpers.channelTypeHasMultiple(null, params.provider, params.channelType)

    let warningMessage
    if (params.provider === "LINKEDIN" && !params.contentUrl && params.uploadedContent && params.uploadedContent.length) {
      warningMessage = "WARNING: Growth Ramp allows, but does not recommend, posting to LinkedIn with an image but without a link. Due to a flaw in LinkedIn's system, the post will be displayed in an irregular way. We are currently working with LinkedIn to find a solution. Thanks"
    }

    const hasUtms = UTM_TYPES.some((utm) => Helpers.safeDataPath(params, `${utm.type}.active`)) && (!this.props.hasContent || currentCampaign.contentUrl)

    let fullLinkPreview = ""
    if (hasUtms) {
      if (this.props.hasContent && currentCampaign.contentUrl) {
        fullLinkPreview += currentCampaign.contentUrl
      } else if (!this.props.hasContent) {
        fullLinkPreview += "https://www.your-link"
      }

      fullLinkPreview += "?"
      fullLinkPreview += Helpers.extractUtmString(params, currentCampaign)
    }

    return (
      <Flexbox direction="column" className={classes.paramsFields}>
        <h2>{Helpers.providerFriendlyName(params.provider)} {params.channelType.titleCase()}{type === "postTemplate" ? " Template" : ""}</h2>
        {account.photoUrl && <img className={classes.profilePic} src={account.photoUrl}/>}
        <div className={classes.accountInfo}>
          <div>{account.userName} ({account.email || "No email on file"})</div>
          {channelTypeHasMultiple && params.postingAs && <div>(Posting as {params.postingAs.toLowerCase()})</div>}
        </div>
        {this.props.hasContent && <Flexbox direction="column" justify="center" className={classes.textEditor}>
          <h3>Post Content</h3>
          <div>Maximum: {maxCharacters};&nbsp;Current Count: {characterCount} {params.contentUrl ? `(including ${URL_LENGTH} for the url length)` : ""}</div>
          <Input
            textarea={true}
            value={params.text || ""}
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
            {params.uploadedContent && params.uploadedContent.map((upload) => {
              return <Flexbox key={upload.url} direction="column">
                <a
                  target="_blank"
                  style={{backgroundImage: `url(${upload.url})`}}
                  className={classes.dropImage}
                  href={upload.url}
                />
                <Icon name="close" className={classes.removeImageBtn} onClick={this.removeUpload.bind(this, upload.url)} />
              </Flexbox>
            })}
          </Flexbox>
        </Flexbox>}
        <Flexbox className={classes.utms} justify="flex-start" align="flex-start" direction="column">
          <h3>UTMs</h3>
          {(!this.props.hasContent || params.contentUrl) && (
            <div className={classes.instructions}>
              <div><strong>Instructions:&nbsp;</strong>"{"{{campaign.name}}"}" will use the campaign name in the utm once the campaign gets published.</div>
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

          {hasUtms && <div className={classes.linkPreview}>
            <div><strong>Full link Preview:&nbsp;</strong>{fullLinkPreview}</div>
            <br/>
            <div>(link will be made into Google short link before posting)</div>
          </div>}

          {this.props.hasContent && (!currentCampaign.contentUrl) ? ( //if you just changed campaign contentUrl, and it wasn't there before, post won't have contentUrl yet in store (though it is in db). So...just use campaign for now...TODO fix that, update teh store
            <div>{false  && "(Utms cannot be set when there is no content URL)"}</div>
          ) : (
            UTM_TYPES.map((utmType) => {
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

        </Flexbox>
          {false && <div>
            <Button className={classes.delayPostBtn} onClick={this.toggleDelayCalendar}><Icon name="calendar-o" />Delay Post</Button>
          </div>}

        <div>
          <h3>Post Publish Time</h3>
          <Checkbox
            value={!!params.delayedUntil || this.state.delayingPost}
            onChange={this.toggleDelayPost}
            label="Set custom publish time?"
          />&nbsp;
          {params.delayedUntil && <div>Delay until: {moment(params.delayedUntil).format("MM-DD-YYYY h:mm a z")}</div>}
          {this.state.delayingPost && <div>
            <div>(will publish whether or not rest of campaign is published)</div>
            <DatePicker
              selected={this.state.selectedDateTime}
              onChange={this.handlePostTime}
              isClearable={true}
              showTimeSelect
              todayButton="Today"
              dateFormatCalendar="LLL"
              dateFormat="LLL"
              timeIntervals={15}
              timeFormat="h:mm a"
              calendarClassName={classes.reactDatepicker}
              className={classes.datePickerInput}
              placeholderText="Click to select time"
            />
          </div>}
        </div>
      </Flexbox>
    )
  } //want to display times in their tz, but store in utc
}

const mapStateToProps = state => {
  return {
    user: state.user,
    currentCampaign: state.currentCampaign, //just for hacky fix when just changed contentUrl for campaign...eventually, do it diffewrent
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
  }
}

const ConnectedPostEditor = connect(mapStateToProps, mapDispatchToProps)(PostEditor)
export default ConnectedPostEditor

