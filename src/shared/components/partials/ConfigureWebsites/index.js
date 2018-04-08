import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { viewSettingActions } from 'shared/actions'
import { Button, Flexbox, Input, Alert, Icon } from 'shared/components/elements'
import { ConfirmationPopup } from 'shared/components/groups'
import { AuditSiteSetup } from 'user/components/partials'
import classes from './style.scss'
import { withRouter } from 'react-router-dom'
import {
  UPDATE_WEBSITE_REQUEST,
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
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
    this.refreshGAAccounts = this.refreshGAAccounts.bind(this)
    this.removeSite = this.removeSite.bind(this)
  }

  componentWillMount() {
    const {goals, availableWebsites} = this.props
    if (!Object.keys(availableWebsites).length ) {
      this.refreshGAAccounts()
    }
  }

  //gets the accounts and all the availableWebsites we could filter/show
  refreshGAAccounts(cbcb) {
    const cb = ({gaAccounts, gscAccounts}) => {
      this.setState({pending: false})
    }
    const onFailure = (err) => {
      this.setState({pending: false})
    }

    this.setState({pending: true})
    this.props.fetchAllGAAccounts({}, cb, onFailure)
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  toggleAddingSite (value = !this.state.addingSite) {
    this.setState({addingSite: value})
  }

  toggleRemovingSite (value = !this.state.removingWebsite) {
    this.setState({removingWebsite: value})
  }

  removeSite (website) {
    this.setState({deletePending: true})

    const cb = () => {
      this.setState({deletePending: false, removingWebsite: false})
    }
    const onFailure = (err) => {
      this.setState({deletePending: false})
      alertActions.newAlert({
        title: "Failure to remove website: ",
        level: "DANGER",
        message: err.message || "Unknown error",
        options: {timer: false},
      })
    }

    const params = {id: website.id, status: "ARCHIVED", userId: website.userId}

    this.props.updateWebsite(params, cb, onFailure)
  }

  viewAudits (e) {
    e && e.preventDefault()

    this.props.history.push("/analytics/content-audit")
  }


  render (){
    const {websites, availableWebsites} = this.props
    const {addingSite} = this.state

    return (
      <div className={classes.configureWebsites}>
        <h2>Websites</h2>
        {Object.keys(websites).map((websiteId) => {
          const website = websites[websiteId]
          const avWebsiteData = availableWebsites.gaSites && availableWebsites.gaSites[website.gaWebPropertyId]
          const profile = avWebsiteData && avWebsiteData.profiles.find((p) => p.id === website.gaProfileId)
          const profileName = profile && profile.name

          return <div className={classes.formSection} key={website.id}>
            <Flexbox justify="space-between">
              <div className={classes.settingLabel}>{website.name}{profileName ? `- ${profileName}`: ""}</div>
              <div className={classes.settingValue}>
                <div>{website.gaSiteUrl}</div>
                <div>
                  <div className={classes.popupWrapper}>
                    <Button style="danger" onClick={this.toggleRemovingSite.bind(this, website.id)}>Remove Site</Button>
                    <ConfirmationPopup
                      show={this.state.removingWebsite === website.id}
                      handleClickOutside={this.toggleRemovingSite.bind(this, false)}
                      onConfirm={this.removeSite.bind(this, website)}
                      onCancel={this.toggleRemovingSite.bind(this, false)}
                      pending={this.state.deletePending}
                      dangerous={true}
                      side="top"
                    />
                  </div>
                </div>
              </div>
            </Flexbox>
          </div>
        })}
        {Object.keys(websites).length === 0 && !addingSite && (
          <div>No website setup yet. Click below to get started</div>
        )}

        {!addingSite ? (
          <div>
            <Button onClick={this.toggleAddingSite.bind(this, true)}><Icon name="plus-circle"/>&nbsp;Add Site</Button>
          </div>
        ) : (
          <div>
            <AuditSiteSetup
              toggleAddingSite={this.toggleAddingSite}
            />
            <Button style="inverted" onClick={this.toggleAddingSite.bind(this, false)}>Cancel</Button>
          </div>
        )}
        <a className={classes.viewAuditsButton} onClick={this.viewAudits}>View Audits</a>
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
    goals: state.goals,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateWebsite: (payload, cb, onFailure) => dispatch({type: UPDATE_WEBSITE_REQUEST, payload, cb, onFailure}),
    fetchAllGAAccounts: (payload, cb, onFailure) => dispatch({type: FETCH_ALL_GA_ACCOUNTS_REQUEST, payload, cb, onFailure}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ConfigureWebsites))

