import { Component } from 'react';
import { connect } from 'react-redux'
import { PROVIDERS } from 'constants/providers'
import { UTM_TYPES } from 'constants/posts'
import { SET_CURRENT_POST} from 'constants/actionTypes'
import {
  withRouter,
} from 'react-router-dom'
import { Card, CardHeader, Flexbox, Button, Icon } from 'shared/components/elements'
import classes from './style.scss'

class PostCard extends Component {
  constructor() {
    super()

  }

  render () {
    const { post, selected, status, onClick, height, maxWidth, className, showUtms, showIcon, showLink, showImages} = this.props
    if (!post) {return null} //shouldn't happen, but whatever

    let subtitle
    switch(status) {
      case "toDelete":
        subtitle = "Ready to Delete"
        break
      case "toCreate":
        subtitle = "Ready to Create"
        break
      case "toUpdate":
        subtitle = "Ready to Update"
        break
    }

    return (
      <Card selected={selected} onClick={onClick} height={height} maxWidth={maxWidth} className={`${className} ${classes[status]}`}>
        <CardHeader title={post.channelType.titleCase()} subtitle={subtitle} icon={showIcon && post.provider.toLowerCase()} iconColor={post.provider.toLowerCase()}/>

        <Flexbox direction="column" >
          {PROVIDERS[post.provider].channelTypes[post.channelType].hasMultiple && post.channelId && (
            <div><strong>Channel:</strong>&nbsp;{post.channelId.name}</div>
          )}

          <div><strong>Text:</strong>&nbsp;{post.text || "(none)"}</div>
          {showLink && <div><strong>Short Link:</strong>&nbsp;{post.shortUrl || "(none)"}</div>}

          {showImages && <Flexbox>
            {post.uploadedContent && post.uploadedContent.map((upload) => {
              return <Flexbox key={upload.url} direction="column">
                <a
                  target="_blank"
                  style={{backgroundImage: `url(${upload.url})`}}
                  className={classes.imageLink}
                  href={upload.url}
                />
              </Flexbox>
            })}
          </Flexbox>}

          {showUtms && <Flexbox flexWrap="wrap" className={classes.utms}>
            {UTM_TYPES.filter((t) => post.t).map((utmType) => {
              //TODO want to extract for use with plan editor...if we have a plan editor
              const type = utmType.value
              const label = utmType.label.titleCase()
              return <div key={type} className={classes.utmField}>
                <span>`${label} UTM`}:</span>&nbsp;<span>{post[type]}</span>
              </div>
            })}
          </Flexbox>}
        </Flexbox>
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
