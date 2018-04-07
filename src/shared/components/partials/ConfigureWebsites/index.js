import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { viewSettingActions } from 'shared/actions'
import { Button, Flexbox, Input, Alert, Icon } from 'shared/components/elements'
import { AuditSiteSetup } from 'user/components/partials'
import classes from './style.scss'
import { withRouter } from 'react-router-dom'
import {
} from 'constants/actionTypes'
import { errorActions, formActions, alertActions } from 'shared/actions'

class ConfigureWebsites extends Component {
  constructor() {
    super()

    this.state = {
      pending: false,
      addingSite: false,
    }

    this.togglePending = this.togglePending.bind(this)
    this.toggleAddingSite = this.toggleAddingSite.bind(this)
    this.viewAudits = this.viewAudits.bind(this)
  }

  componentWillMount() {
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  toggleAddingSite (value = !this.state.addingSite) {
    this.setState({addingSite: value})
  }

  viewAudits (e) {
    e && e.preventDefault()

    this.props.history.push("/analytics/content-audit")
  }


  render (){
    const {websites} = this.props
    const {addingSite} = this.state

    return (
      <div className={classes.configureWebsites}>
        <h2>Websites</h2>
        {Object.keys(websites).map((websiteId) => {
          const website = websites[websiteId]

          return <div className={classes.formSection} key={website.id}>
            <Flexbox justify="space-between">
              <div className={classes.settingLabel}>{website.name}&nbsp;</div>
              <div className={classes.settingValue}>
                <div>{website.gaSiteUrl}</div>
              </div>
            </Flexbox>
          </div>
        })}
        {Object.keys(websites).length === 0 && (
          <div>No website setup yet. Click below to get started</div>
        )}

        {!addingSite ? (
          <div>
            <Button onClick={this.toggleAddingSite.bind(this, true)}><Icon name="plus-circle"/>&nbsp;Add Site</Button>
          </div>
        ) : (
          <div>
            <AuditSiteSetup />
            <Button onClick={this.toggleAddingSite.bind(this, false)}>Cancel</Button>
          </div>
        )}
        <a onClick={this.viewAudits}>View Audits</a>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    availableWebsites: state.availableWebsites,
    errors: state.errors,
    user: state.user,
    websites: state.websites,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ConfigureWebsites))

