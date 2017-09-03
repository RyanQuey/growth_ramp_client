import React, { Component } from 'react';
import firebase from 'firebase';
import fbApp from '../../firebaseApp';
const database = fbApp.database();

class ShareButton extends Component {
  constructor() {
    super()
    this.handleChange = this.handleChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  handleChange(e) {
    e.preventDefault()
    const value = e.target.value;
    this.setState({value});
  }

  onSubmit(e) {
    e.preventDefault()
    console.log( this.state.value );//database.ref('post/').set(" I submit");
    //make sure user cannot submit before login... Or I have to use the watcher that firebase provides
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
      <div id="shareButton">
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload. Rebekah is the most beautiful woman in the whole wide world and I love her rice pillow
        </p>
        <form onSubmit={c.onSubmit}>
          <label> Your post </label>
          <input onChange={c.handleChange}></input>
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default ShareButton
