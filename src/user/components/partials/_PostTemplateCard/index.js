import { Component } from 'react';
import { connect } from 'react-redux'
import { PROVIDERS } from 'constants/providers'
import { UTM_TYPES } from 'constants/posts'
import { SET_CURRENT_POST_TEMPLATE} from 'constants/actionTypes'
import {
  withRouter,
} from 'react-router-dom'
import { Card, CardHeader, Flexbox, Button, Icon } from 'shared/components/elements'
import classes from './style.scss'

class PostTemplateCard extends Component {
  constructor() {
    super()

  }


  render () {
    const { postTemplate, selected, onClick, height, maxWidth, className, showUtms, showIcon, status } = this.props
    if (!postTemplate) {return null} //shouldn't happen, but whatever
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
      <Card selected={selected} onClick={onClick} height={height} maxWidth={maxWidth} className={className}>
        <CardHeader title={postTemplate.channelType.titleCase()} subtitle={subtitle} icon={showIcon && postTemplate.provider.toLowerCase()} iconColor={postTemplate.provider.toLowerCase()}/>

        <Flexbox direction="column" >
          {PROVIDERS[postTemplate.provider].channelTypes[postTemplate.channelType].hasMultiple && postTemplate.channelId && (
            <div><strong>Channel:</strong>&nbsp;{postTemplate.channelId.name}</div>
          )}

          {showUtms && <Flexbox flexWrap="wrap" className={classes.utms}>
            {UTM_TYPES.filter((t) => postTemplate.t).map((utmType) => {
              //TODO want to extract for use with plan editor...if we have a plan editor
              const type = utmType.value
              const label = utmType.label.titleCase()
              return <div key={type} className={classes.utmField}>
                <span>`${label} UTM`}:</span>&nbsp;<span>{postTemplate[type]}</span>
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
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentPostTemplate: (payload, options) => dispatch({type: SET_CURRENT_POST_TEMPLATE, payload, options}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PostTemplateCard))
