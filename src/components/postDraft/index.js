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

    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit(e) {
    e.preventDefault()
    //alert(" Eventually will send to Facebook etc.")
    //make sure user cannot submit before login... Or I have to use the watcher that firebase provides
    let user = this.props.user;
    let payload = { message: this.props.draft.content }//, appsecret_proof: this.props.user.facebookAppSecretProof }

    if (user) {
    // User is signed in.
      FB.api(`/me/feed`, 'draft', payload, (response) => {
        if (!response || response.error) {
          let newError = helpers.handleError(response.error);
            
          this.setState({
            status: "error",
            error: newError,
          });
          
        } else {
          alert(' Draft ID: ' + response.id);
        }
      })
    } else {
    // No user is signed in.
    alert(" Please sign in 1st")
    }
  }

  render() {
    const c = this;
    const draftId = this.props.draft.id
    const userId = this.props.user.uid

    return (
      <div id="post-draft">
        <i onClick={(e) => this.props.removeDraft(e, draftId)} className={`fa fa-times-circle danger clickable `} />&nbsp;
        <div className="status-container">
          {this.state.status === "error" && (
            <span>Error: {this.state.error.message}</span>
          )}
          {this.state.status === "pending" && (
            <span>Saving...</span>
          )}
          {this.state.status === "success" && (
            <span>Draft saved</span>
          )}
        </div>
        <form onSubmit={c.onSubmit}>
          <div>
            <label>Draft Title:</label>
            <FirebaseInput 
              value={this.props.draft.title} 
              name="draftTitle"
              keys={`drafts.${draftId}.title`}
            />
          </div>

          <div>
            <label> Your draft </label>
            <FirebaseInput 
              type="textarea"
              value={this.props.draft.content} 
              keys={`drafts.${draftId}.content`}
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
  }
}

const ConnectedPostDraft = connect(mapStateToProps)(PostDraft)
export default ConnectedPostDraft
