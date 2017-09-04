import React, { Component } from 'react';
import firebase from 'firebase';
import helpers from '../../helpers'
import fbApp from '../../firebaseApp';
import FB from 'fb';
import { connect } from 'react-redux'
import FirebaseInput from '../FirebaseInput'

import moment from 'moment';

const database = fbApp.database();


class PostDraft extends Component {
  constructor() {
    super()

    this.state = {}

    this.handleChange = this.handleChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  handleChange(e) {
    e.preventDefault()
    this.setState({postStatus: "pending"});

    const value = e.target.value;
    const key = e.target.dataset.key;
    const data = {}
    data[key] = value
    const postId = Object.keys(this.props.post)[0]
    const userId = this.props.user.uid

    // TODO: move this into redux
    // for working on a draft to send later

    database.ref(`posts/${postId}/${key}`).update(data, (err) => {
      if (err) {
        let newError = helpers.handleError(err);
          
        this.setState({
          postStatus: "error",
          error: newError,
        });
      } else {
        this.setState({postStatus: "success"});
      }
    });
  }

  onSubmit(e) {
    e.preventDefault()
    //alert(" Eventually will send to Facebook etc.")
    //make sure user cannot submit before login... Or I have to use the watcher that firebase provides
    let user = this.props.user;
    let payload = { message: this.props.post.content }//, appsecret_proof: this.props.user.facebookAppSecretProof }

    if (user) {
    // User is signed in.
      FB.api(`/me/feed`, 'post', payload, (response) => {
        if (!response || response.error) {
          let newError = helpers.handleError(response.error);
            
          this.setState({
            postStatus: "error",
            error: newError,
          });
          
        } else {
          alert(' Post ID: ' + response.id);
        }
      })
    } else {
    // No user is signed in.
    alert(" Please sign in 1st")
    }
  }

  render() {
    const c = this;
    const postId = this.props.post.id
    const userId = this.props.user.uid

    return (
      <div id="post-draft">
        <div className="status-container">
          {this.state.postStatus === "error" && (
            <span>Error: {this.state.error.message}</span>
          )}
          {this.state.postStatus === "pending" && (
            <span>Saving...</span>
          )}
          {this.state.postStatus === "success" && (
            <span>Draft saved</span>
          )}
        </div>
        <form onSubmit={c.onSubmit}>
          <div>
            <label>Post Title:</label>
            <FirebaseInput 
              onChange={false && c.handleChange} 
              data-key={false && "title" }
              value={this.props.post.title} 
              name="postTitle"
              keys={`posts.${postId}.title`}
            />
          </div>

          <div>
            <label> Your post </label>
            <textarea onChange={c.handleChange} data-key="content" value={this.props.post.content} ></textarea>
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
  }
}

const ConnectedPostDraft = connect(mapStateToProps)(PostDraft)
export default ConnectedPostDraft
