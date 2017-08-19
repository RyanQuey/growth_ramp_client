import React, { Component } from 'react';
import fbApp from '../../firebaseApp';
const database = fbApp.database();

class ShareButton extends Component {

  handleChange(e) {
    const value = e.target.value;
    //this.setState({value});
    database.ref('post/').set("this is a test");
  }

  onSubmit() {
    database.ref('post/').set(" I submit");
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
        </form>
      </div>
    );
  }
}

export default ShareButton
