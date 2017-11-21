import { Component } from 'react';
import { connect } from 'react-redux'
import { PROVIDERS } from 'constants/providers'
import { SET_CURRENT_POST} from 'constants/actionTypes'
import {
  withRouter,
} from 'react-router-dom'
import { Card, CardHeader, Flexbox, Button } from 'shared/components/elements'
import classes from './style.scss'

class PostCard extends Component {
  constructor() {
    super()

  }


  render () {
    const { post, selected, onClick, height, maxWidth, className } = this.props

    return (
      <Card selected={selected} onClick={onClick} height={height} maxWidth={maxWidth} className={className}>
        <CardHeader title={post.channel.titleCase()} headerImgUrl={false && Helpers.safeDataPath(post, "uploadedContent.0.url", "")}/>

        <div>
          <h4>{post.text}</h4>
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
    setCurrentPost: (payload, options) => dispatch({type: SET_CURRENT_POST, payload, options}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PostCard))
