import { Component } from 'react';
import { connect } from 'react-redux'
import { PROVIDERS } from 'constants/providers'
import { SET_CURRENT_MODAL, FETCH_PERMISSION_REQUEST } from 'constants/actionTypes'
import {
  withRouter,
} from 'react-router-dom'
import { Card, CardHeader, Flexbox, Button } from 'shared/components/elements'
import classes from './style.scss'

class PostCard extends Component {
  constructor() {
    super()

    this.viewPermissionModal = this.viewPermissionModal.bind(this)
  }

  viewPermissionModal() {
    this.props.setCurrentModal("PostPermissionsModal", {currentPost: this.props.post})
    this.props.fetchPermissionsRequest(this.props.post)
  }

  render () {
    const { post, selected, onClick, height } = this.props
    const permittedChannels = Helpers.permittedChannels(post)

    return (
      <Card selected={selected} onClick={onClick} height={height}>
        <CardHeader title={post.userName} subtitle={post.email} headerImgUrl={post.photoUrl}/>

        <div>
          <h4>Post:</h4>
        </div>

          <div>
            <Button onClick={this.viewPermissionModal}>Choose</Button>
          </div>
      </Card>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    providerPosts: state.providerPosts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload, options) => dispatch({type: SET_CURRENT_MODAL, payload, options}),
    fetchPermissionsRequest: (post, cb) => dispatch({type: FETCH_PERMISSION_REQUEST, payload: {postId: post.id}, cb}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PostCard))
