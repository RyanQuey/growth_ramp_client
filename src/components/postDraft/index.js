import React, { Component } from 'react';
import firebase from 'firebase';
import helpers from '../../helpers'
import fbApp from '../../firebaseApp';
import moment from 'moment';

const database = fbApp.database();


class PostDraft extends Component {
  constructor() {
    super()

    this.state = {}

    this.handleTitle = this.handleTitle.bind(this)
    this.handleContent = this.handleContent.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  handleTitle(e) {
    e.preventDefault()
    const value = e.target.value;
    this.setState({postStatus: "pending"});

    // TODO: move this into redux
    // for working on a draft to send later
    database.ref(`post/`).update({title: value}, (err) => {
      if (err) {
        return helpers.handleError(err);
      }
      this.setState({postStatus: "success"});
    });
  }

  handleContent(e) {
    e.preventDefault()
    const value = e.target.value;
    this.setState({postStatus: "pending"});

    // TODO: move this into redux
    // for working on a draft to send later
    database.ref('post/').update({content: value}, (err) => {
      if (err) {
        return helpers.handleError(err);
      }
      this.setState({postStatus: "success"});
    });
  }

  onSubmit(e) {
    e.preventDefault()
    alert(" Eventually will send to Facebook etc.")
    //make sure user cannot submit before login... Or I have to use the watcher that firebase provides
    // TODO: move this into redux
    var user = firebase.auth().currentUser;

    if (user) {
    // User is signed in.
    } else {
    // No user is signed in.
    }
  }

  render() {
    const c = this;
    return (
      <div id="post-draft">
        <div className="status-container">
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
            <input onChange={c.handleTitle} value={this.props.post.title}></input>
          </div>

          <div>
            <label> Your post </label>
            <textarea onChange={c.handleContent} value={this.props.post.content} ></textarea>
          </div>
          <button type="submit">Promote your stuff</button>
        </form>
      </div>
    );
  }
}

export default PostDraft 

