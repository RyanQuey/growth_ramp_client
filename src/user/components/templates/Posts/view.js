import { Component } from 'react';
import { connect } from 'react-redux'
import { FETCH_POST_REQUEST, CREATE_POST_REQUEST } from 'constants/actionTypes'
import { Button, Flexbox } from 'shared/components/elements'
import {
  PostPicker
} from 'user/components/partials'
import {
  withRouter,
} from 'react-router-dom'

class viewPosts extends Component {
  constructor() {
    super()
    this.state = {
      status: "pending",
    }

    this.handleChoosePost = this.handleChoosePost.bind(this)
    this.createPost = this.createPost.bind(this)
  }

  componentWillMount() {
    this.props.fetchPostRequest({userId: this.props.user.id})
  }

  componentWillReceiveProps(props) {
    if (props.posts !== this.props.posts) {
      this.setState({status: "ready"})
    }
  }

  createPost() {
    //to run on success
    const cb = (newPost) => {
      this.props.history.push(`/posts/${newPost.id}/edit`)
    }

    this.props.createPostRequest(cb)
  }

  handleChoosePost(post) {
    this.setState({
      post,
    })
    //TODO: want to use refs
    //might be able to use bind and the contentIndex ?
    //$(ref)[0].firstElementChild.click();
  }


  render () {
    return (
      <div>
        <h1>Posts</h1>
        {Object.keys(this.props.posts).length > 0 ? (
          <Flexbox justify="center">
            <PostPicker />
          </Flexbox>
        ) : (
          <div>
            <h3>No posts yet.</h3>
            <div>Let's create a new one</div>
            <Button onClick={this.createPost}>New post</Button>
          </div>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPostRequest: (data) => dispatch({type: FETCH_POST_REQUEST, payload: data}),
    createPostRequest: (cb) => {
      const newPost = {
        userId: store.getState().user.id,
      }

      return dispatch({type: CREATE_POST_REQUEST, payload: newPost, cb})
    },
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    posts: state.posts,
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(viewPosts))
