import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { userActions, errorActions } from 'shared/actions'
import { Button, Flexbox, Input } from 'shared/components/elements'
import { SET_POST } from 'constants/actionTypes'


import classes from './style.scss'

class PostPicker extends Component {
  constructor(props) {
    super(props)

    this.editPost = this.editPost.bind(this)
  }

  editPost (post, e) {
    this.props.setPost(post)

    this.props.history.push(`/posts/edit`)
  }

  render() {
    const posts = this.props.posts

    //TODO: set the title using props into the modal container
    return (
      <table>
        <tbody>
        <tr>
          <th>Date Created</th>
          <th>Status</th>
          <th>Plan</th>
          <th>Date Published</th>
          <th></th>
        </tr>
        {posts && Object.keys(posts).map((postId) => {
          const post = posts[postId]
          return (
            <tr key={postId}>
              <td>
                {post.createdAt}
              </td>
              <td>
                {post.status}
              </td>
              <td>
                {post.planId || "will probably do a joins for this information later"}
              </td>
              <td>
                {post.publishedAt || "unpublished"}
              </td>
              <td>
                <button onClick={this.editPost.bind(this, post)}>Edit</button>
                <button disabled="disabled">View Details</button>
              </td>
            </tr>
          )
        })}
        </tbody>
      </table>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setPost: (post) => dispatch({type: SET_POST, payload: post}),
  }
}

const mapStateToProps = (state) => {
  return {
    posts: state.posts,
    plans: state.plans,
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PostPicker))
