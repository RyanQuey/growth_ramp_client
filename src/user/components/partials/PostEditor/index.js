import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Input, Checkbox } from 'shared/components/elements'
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
    this.onUpload = this.onUpload.bind(this)
  }

  updateUtm(utmType, value, e) {
    let post = Object.assign({}, this.props.post)
    post[utmType].value = value

    //update the post form
    let campaignPosts = Object.assign({}, this.props.campaignPosts)
    campaignPosts[post.id] = post

    formActions.setParams("Compose", "posts", campaignPosts)
  }

  disableUtm(utmType, checked, e) {
    //set the param
    let post = Object.assign({}, this.props.post)
    post[utmType].active = checked

    //update the post form
    let campaignPosts = Object.assign({}, this.props.campaignPosts)
    campaignPosts[post.id] = post

    formActions.setParams("Compose", "posts", campaignPosts)
  }

  //TODO debounce
  handleText(value) {
    //set the param
    let post = Object.assign({}, this.props.post)
    post.text = value

    //update the post form
    let campaignPosts = Object.assign({}, this.props.campaignPosts)
    campaignPosts[post.id] = post

    formActions.setParams("Compose", "posts", campaignPosts)
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
      post.uploadedContent.push(fileUrl)

      let campaignPosts = Object.assign({}, this.props.campaignPosts)
      campaignPosts[post.id] = post
      formActions.setParams("Compose", "posts", campaignPosts)
    }

  }

  render() {
    const post = this.props.post
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
              {UTM_TYPES.map((utmType) => (
                <div key={utmType.value}>
                  <Checkbox
                    value={post[utmType.value].active}
                    onChange={this.disableUtm.bind(this, utmType.value)}
                    label={`Enable ${utmType.label.titleCase()} UTM`}
                  />&nbsp;

                  {post[utmType.value].active && <Input
                    placeholder={`${utmType.label.titleCase()} utm for this ${post.channel.titleCase()}`}
                    onChange={this.updateUtm.bind(this, utmType.value)}
                    value={post[utmType.value].value}

                  />}
                </div>
              ))}

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
                  {post.uploadedContent && post.uploadedContent.map((uploadUrl) => {
                    return <DropImage
                      key={uploadUrl}
                      user={this.props.user}
                      onStart={this.onDrop}
                      onSuccess={this.onUpload}
                      onFailure={this.onUpload}
                      onDrop={this.handleOverrideDrop}
                      imageUrl={uploadUrl}
                      className={classes.dropImage}
                    />
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
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
  }
}

const ConnectedPostEditor = connect(mapStateToProps, mapDispatchToProps)(PostEditor)
export default ConnectedPostEditor

