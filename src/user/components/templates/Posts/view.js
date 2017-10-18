import { Component } from 'react';
import { connect } from 'react-redux'
import { FETCH_POST_REQUEST } from 'constants/actionTypes'
import {
  PostPicker
} from 'user/components/partials'

class viewPosts extends Component {
  constructor() {
    super()
    this.state = {
      status: "pending",
    }

    this.handleChoosePost = this.handleChoosePost.bind(this)
  }

  componentWillMount() {
    console.log("now fetching posts");
    this.props.fetchPostRequest({userId: this.props.user.id})
  }

  componentWillReceiveProps(props) {
    if (props.posts !== this.props.posts) {
      this.setState({status: "ready"})
    }
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
          <div>
            <PostPicker />
          </div>
        ) : (
          <div>
            <h3>No posts yet.</h3>
            <div>Let's create a new one</div>
            <button onClick={() => {this.props.history.push("/posts/new")}}>Create a post</button>
          </div>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPostRequest: (data) => dispatch({type: FETCH_POST_REQUEST, payload: data}),
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    posts: state.posts,
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(viewPosts)
