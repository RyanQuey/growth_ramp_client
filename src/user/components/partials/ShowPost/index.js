import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Input, Checkbox, Icon } from 'shared/components/elements'
import {
} from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import { UTM_TYPES } from 'constants/posts'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class ShowPost extends Component {
  constructor() {
    super()

    this.state = {
    }

  }

  render() {
    const post = this.props.post
    if (!post) {return null} //shouldn't happen, but whatever
    let utmFields = Object.assign({}, Helpers.safeDataPath(this.props.formOptions, `${post.id}.utms`, {}))

    return (
      <Flexbox direction="column" >
        <h2>{post.channelType.titleCase()}</h2>
        <div className={classes.postFields}>
          <div>
            <Flexbox direction="column" justify="center" className={classes.textEditor}>
              <div>
                {post.text}
              </div>
              <Flexbox>
                {post.uploadedContent && post.uploadedContent.map((upload) => {
//console.log(upload);
                  return <Flexbox key={upload.url} direction="column">
                    <a
                      target="_blank"
                      style={{backgroundImage: `url(${upload.url})`}}
                      className={classes.dropImage}
                      href={upload.url}
                    />
                    <Icon name="close" onClick={this.removeUpload.bind(this, upload.url)} />
                  </Flexbox>
                })}
              </Flexbox>
            </Flexbox>

            <Flexbox flexWrap="wrap" className={classes.utms}>
              {UTM_TYPES.map((utmType) => {
                //TODO want to extract for use with plan editor
                const type = utmType.type
                const label = utmType.label
                const active = Helpers.safeDataPath(post, `${type}.active`, false)
                const value = Helpers.safeDataPath(post, `${type}.value`, "")
                const key = Helpers.safeDataPath(post, `${type}.key`, "")
                return !active ? null : (
                  <div key={type} className={classes.utmField}>
                    <span>`${label.titleCase()} UTM`}:</span>&nbsp;

                    <span>
                      {value}
                    </span>
                  </div>
                )
              })}
            </Flexbox>

          </div>
        </div>
      </Flexbox>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const ConnectedShowPost = connect(mapStateToProps, mapDispatchToProps)(ShowPost)
export default ConnectedShowPost

