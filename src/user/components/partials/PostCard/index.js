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
    const { post, selected, onClick, height, maxWidth, className, showUtms, showIcon, showLink, showImages, showText = true, subtitle, small, wrapperClass, smallIcon} = this.props
    if (!post) {return null} //shouldn't happen, but whatever

    let status
    if (post.toDelete) {
      status = "toDelete"
    } else if (typeof post.id === "string") {
      status = "toCreate"
    } else if (post.dirty){
      status = "toUpdate"
    }

    let sub
    switch(status) {
      case "toDelete":
        break
      case "toCreate":
        sub = "Ready to Create"
        break
      case "toUpdate":
        sub = "Ready to Update"
        break
    }

    const hasMultiple = Helpers.channelTypeHasMultiple(null, post.provider, post.channelType)
    const activeUtms = UTM_TYPES.filter((t) => post[t.type] && post[t.type].active && post[t.type].value)
    let userName = (Helpers.accountFromPost(post) || {}).userName
    let channelName = (Helpers.channelFromPost(post) || {}).name
    let text = post.text
    if (small) {
      userName = userName && userName.truncate(19)
      channelName = channelName && channelName.truncate(19)
      text = text && text.truncate(24)
    }

    return (
      <Card selected={selected} onClick={onClick} height={height} maxWidth={maxWidth} wrapperClass={wrapperClass} className={`${className} ${classes[status]} ${small ? classes.small : ""}`}>
        <CardHeader className={small ? classes.smallHeader : ""} title={post.channelType.titleCase()} subtitle={subtitle || sub} icon={showIcon && post.provider.toLowerCase()} iconColor={post.provider.toLowerCase()}/>

        <Flexbox direction="column" className={classes.content}>
          <div className={classes.contentSection}><span className={classes.cardLabel}>Account:</span>&nbsp;{userName ? userName : "Error: Could not be found"}</div>
          {hasMultiple && post.channelId && (
            <div className={classes.contentSection}><span className={classes.cardLabel}>Channel:</span>&nbsp;{channelName ? channelName : "Error: Could not be found"}</div>
          )}
          {!small && <br/>}
          {showText && <div className={`${classes.contentSection}`}><span className={classes.cardLabel}>Text:</span>&nbsp;<span className={classes.text}>{post.text ? post.text : "(none)"}</span></div>}
          {showLink && <div className={classes.contentSection}><span className={classes.cardLabel}>Short Link:</span>&nbsp;{post.shortUrl || "(none)"}</div>}

          {showImages && <Flexbox  className={classes.contentSection}>
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
          {!small && <br/>}

          {showUtms && <Flexbox className={`${classes.utms} ${classes.contentSection}`} justify="flex-start" align="flex-start" direction="column">
            {activeUtms.map((utmType) => {
              //TODO want to extract for use with plan editor...if we have a plan editor
              const type = utmType.type
              const label = utmType.label.titleCase()
              return <div key={type} className={classes.utmField}>
                <span className={classes.cardLabel}>{label} UTM:</span>&nbsp;<span>{post[type].value}</span>
              </div>
            })}
          </Flexbox>}
          {!small && <br/>}
          {!small && post.delayedUntil && <div className={classes.contentSection}><span className={classes.cardLabel}>Delayed Publishing Until:</span>&nbsp;{moment(post.delayedUntil).format("MM-DD-YYYY h:mm a")}</div>}
        </Flexbox>
      </Card>
    )
  }
}

const mapStateToProps = state => {
  return {
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PostCard))
