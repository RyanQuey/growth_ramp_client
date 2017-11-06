import React, { Component } from 'react';
import { connect } from 'react-redux'
import {
 EditPost
} from 'user/components/templates'
import { CREATE_POST_REQUEST } from 'constants/actionTypes'
import ViewPosts from './view'
import {
  withRouter,
  Route,
  Switch,
} from 'react-router-dom'

class Posts extends Component {
  constructor() {
    super()
    this.state = {
      //will need to use a store, if this is ever used in subcomponents of the subcomponents
      //currentPost: {},
    }

  }

  componentDidMount() {
    //if (this.props.location.pathname === "/posts/edit" && !this.props.currentPost) {
    //  this.props.history.push("/posts")
    //}
  }

  render() {
    //const posts = this.props.posts

    return (
      <div>
        <ViewPosts />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    posts: state.posts,
    currentPost: state.currentPost,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    createPostRequest: (data) => dispatch({type: CREATE_POST_REQUEST, payload: data}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Posts)


