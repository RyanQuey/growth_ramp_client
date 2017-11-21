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
import { UTM_TYPES } from 'constants/posts'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class PostEditor extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.handleText = this.handleText.bind(this)
    this.onDrop = this.onDrop.bind(this)
    this.onOverrideDrop = this.onOverrideDrop.bind(this)
    this.removeUpload = this.removeUpload.bind(this)
    this.onUpload = this.onUpload.bind(this)
  }

  updateUtm(utmType, value, e) {
    //set the param
    let post = Object.assign({}, this.props.post)
    post[utmType] = value
    post.dirty = true
console.log(value );
    //update the post form
    formActions.setParams("Compose", "posts", {[post.id]: post})
  }

  toggleUtm(utmType, checked, e) {
    //update the post form
    let post = Object.assign({}, this.props.post)
    let utmFields = Object.assign({}, Helpers.safeDataPath(this.props.formOptions, `${this.props.post.id}.utms`, {}))
    utmFields[utmType] = checked
    post.dirty = true

    formActions.setOptions("Compose", "posts", {[this.props.post.id]: {utms: utmFields}})
    formActions.setParams("Compose", "posts", {[post.id]: post})
  }

  //TODO debounce
  handleText(value) {
    //set the param
    let post = Object.assign({}, this.props.post)
    post.text = value
    post.dirty = true

    //update the post form
    formActions.setParams("Compose", "posts", {[post.id]: post})
  }

  //NOTE: cannot save a file object in redux, at least not in a easy way.
  //Just upload here
  onDrop(acceptedFile, rejectedFile) {
    if (acceptedFile) {
      this.setState({pending: true})
    } else {
      console.log("failed to drop file");
    }
  }

//TODO need a button
  removeUpload(oldFileUrl){
    //TODO also remove from b2
    let uploadedFiles = [...this.props.uploadedFiles]
    _.remove(uploadedFiles, (f) => f.url === oldFileUrl)

    formActions.setParams("Compose", "uploadedFiles", uploadedFiles)
  }

  onOverrideDrop(oldFileUrl, acceptedFile, rejectedFile) {
    //remove the old file
    this.removeUpload(oldFileUrl)
    if (acceptedFile) {
      this.setState({pending: true})
    } else {
      console.log("failed to drop file");
    }
  }

  onUpload(result) {
    this.setState({pending: false})
    //is successful, a url
    if (typeof result === "string") {
      const fileUrl = result
      //update the uploadedFiles list...which I could use to clear out unused files
      let uploadedFiles = [...this.props.uploadedFiles]
      uploadedFiles.push(fileUrl)

      formActions.setParams("Compose", "uploadedFiles", uploadedFiles)

      //update the post form
      let post = Object.assign({}, this.props.post)
      if (!post.uploadedContent) {
        post.uploadedContent = []
      }
      post.uploadedContent.push({url: fileUrl, type: "IMAGE"})
      post.dirty = true

      formActions.setParams("Compose", "posts", {[post.id]: post})
    }

  }

  render() {
    const post = this.props.post
    let utmFields = Object.assign({}, Helpers.safeDataPath(this.props.formOptions, `${this.props.post.id}.utms`, {}))

console.log("this is a post");
console.log(post);
    return (
      <Flexbox direction="column">
        <h2>{post.channel.titleCase()}</h2>
        {false && <div className={classes.disablePost}>
          <Checkbox
            value={post.active}
            onChange={this.disablePost}
          />&nbsp;Disable post
        </div>}
        <div className={classes.postFields}>
            <div>
              {UTM_TYPES.map((utmType) => {
                //TODO want to extract for use with plan editor...if we have a plan editor
                const type = utmType.value
                const label = utmType.label
                const active = utmFields[type]
                return <div key={type}>
                  <Checkbox
                    value={active}
                    onChange={this.toggleUtm.bind(this, type)}
                    label={`Enable ${label.titleCase()} UTM`}
                  />&nbsp;

                  {active && <Input
                    placeholder={`${label.titleCase()} utm for this ${post.channel.titleCase()}`}
                    onChange={this.updateUtm.bind(this, type)}
                    value={post[type]}
                  />}
                </div>
              })}

              <Flexbox direction="column" className={classes.textEditor}>
                <Input
                  label="Your post"
                  textarea={true}
                  value={post.text}
                  placeholder={`Your post`}
                  onChange={this.handleText}
                />

                <label>Click or drag a file to upload</label>
                <Flexbox>
                  <DropImage
                    user={this.props.user}
                    label="+"
                    onStart={this.onDrop}
                    onSuccess={this.onUpload}
                    onFailure={this.onUpload}
                    className={classes.dropImage}
                  />
                  {post.uploadedContent && post.uploadedContent.map((upload) => {
console.log(upload);
                    return <div key={upload.url}>
                      <DropImage
                        user={this.props.user}
                        onStart={this.onDrop}
                        onSuccess={this.onUpload}
                        onFailure={this.onUpload}
                        onDrop={this.handleOverrideDrop}
                        imageUrl={upload.url}
                        className={classes.dropImage}
                      />
                      <Icon name="close" onClick={this.removeUpload.bind(this, upload.url)} />
                    </div>
                  })}
                </Flexbox>
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
    uploadedFiles: Helpers.safeDataPath(state.forms, "Compose.uploadedFiles", []),
    formOptions: Helpers.safeDataPath(state.forms, "Compose.posts.options", {}),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
  }
}

const ConnectedPostEditor = connect(mapStateToProps, mapDispatchToProps)(PostEditor)
export default ConnectedPostEditor

