import React, { Component } from 'react';
import firebase from 'firebase';
import helpers from '../../helpers'
import fbApp from '../../firebaseApp';
import PostDraft from '../postDraft';
import { connect } from 'react-redux'
const database = fbApp.database();

class ShareButton extends Component {
  constructor() {
    super()
    this.state = {}

    this.handleAddPost = this.handleAddPost.bind(this)
  }

  componentDidMount() {

  }

  handleAddPost (e){
    e.preventDefault()
    this.setState({postStatus: "pending"});

    // TODO: move this into redux
    // for working on a draft to send later
    let userId = this.props.user.uid
    let blankPost = {
      title: "",
      content: "",
      userId,
    }
    let postId = database.ref("posts").push(blankPost).key;
    let relationEntry = {}
    relationEntry[postId] = true;

    database.ref(`users/${userId}/posts`).set(relationEntry, (err) => {
      if (err) {
        return helpers.handleError(err);
      }

      this.setState({postStatus: "success"});
      //next, called a success event and retrieve from firebase
    });
  }

  render() {
    const c = this;
    return (
      <div id="shareButton">
        <p className="App-intro">
          Rebekah is the most beautiful woman in the whole wide world and I love her rice pillow
        </p>
        {this.props.user ? (
          <div className="post-container">
            <div className="posts-draft-container">
              {this.props.posts && Object.keys(this.props.posts).map((key) => {return (
                <PostDraft post={this.props.posts[key]} key={key}/>
              )})}
            </div>
            <a href="#" onClick={this.handleAddPost}>Add a post</a>
          </div> 
        ) : (
          <div> Please login </div>
        )} 
         <div
          className="fb-like"
          data-share="true"
          data-width="450"
          data-show-faces="true">Like
        </div> 
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    posts: state.posts,
  }
}

const ConnectedShareButton = connect(mapStateToProps)(ShareButton)
export default ConnectedShareButton

