import React, { Component } from 'react';
import firebase from 'firebase';
import helpers from '../../helpers'
import fbApp from '../../firebaseApp';
import PostDraft from '../postDraft';
import { createDraftRequested } from '../../actions'
import { connect } from 'react-redux'
const database = fbApp.database();

class ShareButton extends Component {
  constructor() {
    super()
    this.state = {}

    this.handleCreateDraft = this.handleCreateDraft.bind(this)
    this.handleRemoveDraft = this.handleRemoveDraft.bind(this)
  }

  componentDidMount() {

  }

  handleCreateDraft (e){
    e.preventDefault()
    this.setState({status: "pending"});
    let userId = this.props.user.uid
    this.props.createDraftRequested({userId})
  }

  handleRemoveDraft (e, draftId) {
    e.preventDefault()
    let userId = this.props.user.uid

    let updates = {}
    updates[`users/${userId}/drafts/${draftId}`] = null
    updates[`drafts/${draftId}`] = null
    database.ref().update(updates, (err) => {
      if (err) {
        return helpers.handleError(err);
      }

      this.setState({status: "success"});
      //next, call a success event and retrieve from firebase
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
          <div className="draft-container">
            <div className="drafts-draft-container">
              {this.props.drafts && Object.keys(this.props.drafts).map((key) => {return (
                <PostDraft 
                  draft={Object.assign({id: key}, this.props.drafts[key])} 
                  key={key}
                  removeDraft={this.handleRemoveDraft}
                />
              )})}
            </div>
            <a href="#" onClick={this.handleCreateDraft}>Add a draft</a>
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
    drafts: state.drafts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    createDraftRequested: (data) => dispatch(createDraftRequested(data)),
  }
}

const ConnectedShareButton = connect(mapStateToProps, mapDispatchToProps)(ShareButton)
export default ConnectedShareButton

