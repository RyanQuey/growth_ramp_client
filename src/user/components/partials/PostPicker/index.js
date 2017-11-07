import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { userActions, errorActions } from 'shared/actions'
import { Button, Flexbox, Input } from 'shared/components/elements'
import { ButtonGroup } from 'shared/components/groups'
import {
  SET_POST,
  DESTROY_POST_REQUEST,
} from 'constants/actionTypes'


import classes from './style.scss'

class PostPicker extends Component {
  constructor(props) {
    super(props)

    this.editPost = this.editPost.bind(this)
    this.removePost = this.removePost.bind(this)
  }

  editPost (post, e) {
    this.props.history.push(`/posts/${post.id}/edit`)
  }

  removePost (post, e) {
    //might just archive, but leaving that to the api to figure out :)
    this.props.destroyPostRequest(post)
  }

  render() {
    const posts = this.props.posts

    //TODO: set the title using props into the modal container (will do a modal...or just a show view?? for each post)
    //use flexbox. Assign consistent column lengths to still achieve tablelike look, but with control over spacing etc.
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
                {(post.planId && this.props.plans[post.planId].name) || "No plan"}
              </td>
              <td>
                {post.publishedAt || "unpublished"}
              </td>
              <td>
                <ButtonGroup vertical={true}>
                  <Button onClick={this.editPost.bind(this, post)}>Edit</Button>
                  {post.status === "DRAFT" && <Button onClick={this.removePost.bind(this, post)}>Delete</Button>}
                  <Button disabled={true}>View Details</Button>
                </ButtonGroup>
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
    destroyPostRequest: (post) => dispatch({type: DESTROY_POST_REQUEST, payload: post}),
  }
}

const mapStateToProps = (state) => {
  return {
    posts: state.posts,
    currentPost: state.currentPost,
    plans: state.plans,
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PostPicker))
