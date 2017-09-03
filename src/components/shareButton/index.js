import React, { Component } from 'react';
import firebase from 'firebase';
import helpers from '../../helpers'
import fbApp from '../../firebaseApp';
import PostDraft from '../postDraft';
const database = fbApp.database();

class ShareButton extends Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    const c = this;
    // TODO: move this into redux

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        c.setState({loggedIn: true, user})
        // User is signed in.
        //eventually want to stuff to be in the redux
        //Only want to retrieve this user's posts
        database.ref(`post/`).on("value", (snapshot) => {
          c.setState({posts: snapshot.val()})
        }, (err) => {
          helpers.handleError(`The read failed: ${err.code}`)
        })
      } else {
        c.setState({loggedIn: false})
        database.ref(`post/`).off("value")
        // No user is signed in.
      }
    });

  }

  

  render() {
    const c = this;
    return (
      <div id="shareButton">
        <p className="App-intro">
          Rebekah is the most beautiful woman in the whole wide world and I love her rice pillow
        </p>
        {/*this.state.posts.map((post) => {return (*/ }
        {this.state.loggedIn && this.state.posts ? ( 
          <PostDraft post={this.state.posts} user={this.state.user}/>
        ) : (
          <div> Please login </div>
        )} 
      </div>
    );
  }
}

export default ShareButton
