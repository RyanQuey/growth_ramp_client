import React, { Component } from 'react';
import { connect } from 'react-redux'
import {
  PromoTool
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
      currentPost: {},
    }

    this.handleChoosePost = this.handleChoosePost.bind(this)
  }

  componentDidMount() {

  }

  handleChoosePost(post) {
    this.setState({
      post,
    })
    //TODO: want to use refs
    //might be able to use bind and the contentIndex ?
    //$(ref)[0].firstElementChild.click();
  }

  render() {
    const posts = this.props.posts

    return (
      <div>
        <Switch>
          <Route exact path="/posts" component={ViewPosts} />
          <Route path="/posts/new" component={PromoTool} />
          <Route path="/posts/edit" component={PromoTool} />
        </Switch>
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
    createPostRequest: (data) => dispatch({type: CREATE_POST_REQUEST, payload: data}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Posts)


