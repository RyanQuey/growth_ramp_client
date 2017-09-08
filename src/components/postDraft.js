import React, { Component } from 'react';
import firebase from 'firebase';
import { connect } from 'react-redux'
import FirebaseInput from './shared/firebaseInput'
import fbApp from '../firebaseApp';
import { setInputVal, postPublishRequest } from '../actions'

const database = fbApp.database();


class PostDraft extends Component {
  constructor() {
    super()

    this.state = {}

    this.onSubmit = this.onSubmit.bind(this)
    this.handleRemovePost = this.handleRemovePost.bind(this)
  }

  handleRemovePost() {
    //not yet removing the post ID from that users post list...
    //Not sure if I'll ever use that users post list though
    //will probably either use a different action, or rename this one to just update any resource/update any post
    this.props.setInputVal({ 
      path: `posts/${this.props.post.id}`, 
      value: null 
    })
  }

  onSubmit(e) {
    e.preventDefault()
    //alert(" Eventually will send to Facebook etc.")
    //make sure user cannot submit before login... Or I have to use the watcher that firebase provides
    let user = this.props.user;
    let payload = { 
      post: this.props.post, 
      //hard coding for now
      providers: ["facebook", "twitter"],
      //appsecret_proof: this.props.user.facebookAppSecretProof ,
    }

    if (user) {
      this.props.postPublishRequest(payload)
    } else {
      alert(" Please sign in 1st")
    }
  }

  render() {
    const c = this;
    const postId = this.props.post.id
    const userId = this.props.user.uid

    return (
      <div id="post-draft">
        <i onClick={this.handleRemovePost} className={`fa fa-times-circle danger clickable `} />&nbsp;
        <div className="status-container">
          {this.state.status === "error" && (
            <span>Error: {this.state.error.message}</span>
          )}
          {this.state.status === "pending" && (
            <span>Saving...</span>
          )}
          {this.state.status === "success" && (
            <span>post saved</span>
          )}
        </div>
        <form onSubmit={c.onSubmit}>
          <div>
            <label>post Title:</label>
            <FirebaseInput 
              value={this.props.post.title} 
              name="postTitle"
              keys={`posts.${postId}.title`}
            />
          </div>

          <div>
            <label> Your post </label>
            <FirebaseInput 
              type="textarea"
              value={this.props.post.content} 
              keys={`posts.${postId}.content`}
            />
          </div>
          <button type="submit">Promote your stuff</button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    tokens: state.tokens,
  }
}

const ConnectedPostDraft = connect(mapStateToProps, { setInputVal, postPublishRequest })(PostDraft)
export default ConnectedPostDraft
