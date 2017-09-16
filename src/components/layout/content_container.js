import React, { Component } from 'react';
import helpers from '../../helpers'
import { connect } from 'react-redux'

class ContentContainer extends Component {
  constructor() {
    super()
    this.state = {}

    this.handlePostCreate = this.handlePostCreate.bind(this)
  }

  componentDidMount() {

  }

  handlePostCreate (e){
    e.preventDefault()
    this.setState({status: "pending"});
    let userId = this.props.user.uid
    this.props.postCreateRequest({userId})
  }

  render() {
    const c = this;
    return (
      <div id="content-container">
        <p className="App-intro">
          Rebekah is the most beautiful woman in the whole wide world and I love her rice pillow
        </p>
        {this.props.user ? (
          <div className="post-container">
            <div className="posts-post-container">
              {this.props.posts && Object.keys(this.props.posts).map((key) => {return (
                <PostDraft 
                  post={Object.assign({id: key}, this.props.posts[key])} 
                  key={key}
                  removePost={this.handleRemovePost}
                />
              )})}
            </div>
            <a href="#" onClick={this.handlePostCreate}>Add a post</a>
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
const mapDispatchToProps = (dispatch) => {
  return {
    postCreateRequest: (data) => dispatch(postCreateRequest(data)),
  }
}

const ConnectedContentContainer = connect(mapStateToProps, mapDispatchToProps)(ContentContainer)
export default ConnectedContentContainer

