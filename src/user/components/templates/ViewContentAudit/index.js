import { Component } from 'react';
import { connect } from 'react-redux'
import {
  AUDIT_CONTENT_REQUEST,
  GET_GA_GOALS_REQUEST,
  FETCH_AUDIT_REQUEST,
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import {
} from 'user/components/partials'
import { SocialLogin } from 'shared/components/partials'
import {  } from 'user/components/groups'
import { AuditMetadata, AuditSiteSelector, ContentAuditTable } from 'user/components/partials'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
import {formActions, alertActions} from 'shared/actions'
import {
  withRouter,
} from 'react-router-dom'
import analyticsHelpers from 'helpers/analyticsHelpers'
import classes from './style.scss'

class ViewContentAudit extends Component {
  constructor() {
    super()
    this.state = {
      pending: false,
      settingsOpen: true,
    }

    this.togglePending = this.togglePending.bind(this)
    this.setFilters = this.setFilters.bind(this)
    this.auditSite = this.auditSite.bind(this)
    this.fetchAudits = this.fetchAudits.bind(this)
    this.refreshGAAccounts = this.refreshGAAccounts.bind(this)
    this.toggleSettings = this.toggleSettings.bind(this)
  }

  componentWillMount() {
    const {filters, goals} = this.props

    const currentWebsiteId = Helpers.safeDataPath(this.props, "currentWebsite.id")
    if (currentWebsiteId) {
      this.fetchAudits(currentWebsiteId)
    }

    this.refreshGAAccounts()
  }

  componentWillReceiveProps(props) {
    const currentWebsiteId = Helpers.safeDataPath(props, "currentWebsite.id")
    if (
      currentWebsiteId &&
      Helpers.safeDataPath(this.props, "currentWebsite.id") !== currentWebsiteId
    ) {
      this.fetchAudits(currentWebsiteId)
    }
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value}) //only for social login so far
  }

  toggleSettings (value = !this.state.settingsOpen, e) {
    this.setState({settingsOpen: value})
  }

  // filter should be object, keys being params that will be overwritten for the analytics filters
  // TODO get rid of; no longer using
  setFilters(filtersToMerge, options = {}) {
    formActions.setParams("AuditContent", "filters", filtersToMerge)
  }

  fetchAudits (websiteId) {
    const cb = () => {
      this.setState({pending: false})
    }
    const onFailure = (err) => {
      this.setState({pending: false})
      alertActions.newAlert({
        title: "Failure to audit content: ",
        level: "DANGER",
        message: err.message || "Unknown error",
        options: {timer: false},
      })
    }

    this.setState({pending: true})

    this.props.fetchAudits({websiteId}, cb, onFailure)
  }

  //gets the accounts and all the availableWebsites we could filter/show
  refreshGAAccounts(cbcb) {
    const cb = ({gaAccounts, gscAccounts}) => {
      this.setState({pending: false})
    }
    const onFailure = (err) => {
      this.setState({pending: false})
      alertActions.newAlert({
        title: "Failure to fetch Google Analytics accounts: ",
        level: "DANGER",
        message: err.message || "Unknown error",
        options: {timer: false},
      })
    }

    this.setState({pending: true})
    this.props.fetchAllGAAccounts({}, cb, onFailure)
  }

  auditSite (e) {
    e && e.preventDefault()
    //TODO set filters to store, and then use in saga
    formActions.formPersisted("AuditContent", "filters")
    const cb = () => {
      this.setState({pending: false})
    }
    const onFailure = (err) => {
      this.setState({pending: false})
      alertActions.newAlert({
        title: "Failure to audit content: ",
        level: "DANGER",
        message: err.message || "Unknown error",
        options: {timer: false},
      })
    }

    this.setState({pending: true})

    // be careful using props, since could be out of date (if just changed filters before props could get propogated)
    const {audits, filters, analytics, currentWebsite, user} = this.props
    const dataset = analyticsHelpers.getDataset("contentAudit", filters, null, {testGroup: "nonGoals"})

    let paramsToMerge = analyticsHelpers.getDatasetDefaultFilters(dataset)
    const params = Object.assign({}, filters, paramsToMerge, {
      testGroup: "nonGoals",
      dateLength: "month",
      userId: user.id,
      websiteId: currentWebsite.id},
      _.pick(currentWebsite, ["gscSiteUrl", "gaProfileId", "gaSiteUrl", "gaWebPropertyId", "googleAccountId"]),
    )


    //don't need last used anymore
    //formActions.setParams("AuditContent", "dataset", {lastUsedDataset: dataset})

    this.props.auditSite(params, cb, onFailure)

    //getting goals now too
    const {websiteId, profileId, gaWebPropertyId, googleAccountId} = params
    if (!this.props.goals[gaWebPropertyId]) {
      this.props.getGoals({gaWebPropertyId, googleAccountId}) //only be websiteId for now. can manually sort by profile or webproperty in frontend later too
    }
  }

  render () {
    const {pending, settingsOpen} = this.state
    const {audits, analytics, websites, currentAudit, currentWebsite} = this.props
    //wait to finish initializing store at least
    if (false) {
      return <Icon name="spinner"/>
    }

    const query = new URLSearchParams(document.location.search)
    const webpageQueryValue = query.get("webpage")

    return (
      <div className={classes.viewAnalytics}>
        <h1>Content Audit</h1>
        <div>
          {currentWebsite ? currentWebsite.name : ""}
        </div>

        <h2>Settings</h2>
        <a className={classes.toggleSettingsBtn} onClick={this.toggleSettings.bind(this, !settingsOpen)}>{settingsOpen ? "Hide Settings" : "Show Settings"}</a>
        <div className={`${classes.settings} ${settingsOpen ? classes.open : classes.closed}`}>
          <AuditSiteSelector
            togglePending={this.togglePending}
          />

          {currentWebsite && Object.keys(audits).length && (
            <AuditMetadata />
          )}
        </div>

        {currentWebsite && (
          Object.keys(audits).length ? (
            <div>
              {currentAudit &&
                <div>
                  <ContentAuditTable
                    currentWebsite={currentWebsite}
                  />
                </div>
              }
            </div>
          ) : (
            <div>
              No audits yet. Click below to get started!
              <Button
                onClick={this.auditSite}
                className={classes.twoColumns}
              >
                Audit site
              </Button>
            </div>
          )
        )}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllGAAccounts: (payload, cb, onFailure) => dispatch({type: FETCH_ALL_GA_ACCOUNTS_REQUEST, payload, cb, onFailure}),
    getGoals: (payload, cb, onFailure) => dispatch({
      type: GET_GA_GOALS_REQUEST,
      payload,
      cb,
      onFailure,
    }),
    fetchAudits: (payload, cb, onFailure) => dispatch({
      type: FETCH_AUDIT_REQUEST,
      payload,
      cb,
      onFailure,
    }),
    auditSite: (payload, dataset, cb, onFailure) => dispatch({
      type: AUDIT_CONTENT_REQUEST,
      payload,
      dataset,
      cb,
      onFailure,
    }),
  }
}

const mapStateToProps = state => {
  return {
    analytics: state.analytics,
    audits: state.audits || {},
    currentAudit: state.currentAudit,
    user: state.user,
    goals: state.goals,
    websites: state.websites,
    currentWebsite: state.currentWebsite,
    filters: Helpers.safeDataPath(state, "forms.AuditContent.filters.params", {}),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewContentAudit))
