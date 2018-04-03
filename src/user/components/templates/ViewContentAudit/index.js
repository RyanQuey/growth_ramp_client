import { Component } from 'react';
import { connect } from 'react-redux'
import {
  AUDIT_CONTENT_REQUEST,
  GET_GA_GOALS_REQUEST,
  FETCH_AUDIT_REQUEST,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import {
} from 'user/components/partials'
import { SocialLogin } from 'shared/components/partials'
import {  } from 'user/components/groups'
import { AuditSiteSetup, ContentAuditTable } from 'user/components/partials'
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
    }

    this.togglePending = this.togglePending.bind(this)
    this.setFilters = this.setFilters.bind(this)
    this.auditSite = this.auditSite.bind(this)
    this.fetchAudits = this.fetchAudits.bind(this)
  }

  componentWillMount() {
    const {filters, goals} = this.props
//TODO will set start and end date in api, per test (though start out with all the same)
    if (!filters || !filters.startDate) {
      const yesterday = moment().subtract(1, "day")
      const options = {
        startDate: yesterday.clone().subtract(1, "year").format("YYYY-MM-DD"),
        endDate: yesterday.format("YYYY-MM-DD"),
        //orderBy: {
        //  fieldName: "ga:pageviews", sortOrder: "DESCENDING"
        //},
      }

      this.setFilters(options)
    }

    const currentWebsiteId = Helpers.safeDataPath(this.props, "currentWebsite.id")
    if (currentWebsiteId) {
      this.fetchAudits(currentWebsiteId)
    }

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
    const {audits, filters, analytics, datasetParams, currentWebsite, user} = this.props
    const dataset = analyticsHelpers.getDataset("contentAudit", filters, null, {testGroup: "nonGoals"})

    let paramsToMerge = analyticsHelpers.getDatasetDefaultFilters(dataset)
    const params = Object.assign({}, filters, paramsToMerge, {dataset, userId: user.id}, _.pick(currentWebsite, ["gscSiteUrl", "gaProfileId", "gaSiteUrl", "gaWebPropertyId", "googleAccountId"]))


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
    const {pending} = this.state
    const {audits, filters, analytics, datasetParams, websites, currentWebsite} = this.props

    //wait to finish initializing store at least
    if (!filters) {
      return <Icon name="spinner"/>
    }

    const query = new URLSearchParams(document.location.search)
    const webpageQueryValue = query.get("webpage")

    return (
      <div className={classes.viewAnalytics}>
        <h1>Content Audit</h1>

        {!currentWebsite ? (
          <AuditSiteSetup
            togglePending={this.togglePending}
          />
        ) : (
          <div>
            <div>{currentWebsite.name}</div>
            {Object.keys(audits).length ? (
              <div>
                <ContentAuditTable
                  currentWebsite={currentWebsite}
                />
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
            )}
          </div>
        )}


      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
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
    contentAudit: state.contentAudit,
    user: state.user,
    goals: state.goals,
    websites: state.websites,
    currentWebsite: state.websites && state.websites[0],
    datasetParams: Helpers.safeDataPath(state, "forms.AuditContent.dataset.params", {}),
    filters: Helpers.safeDataPath(state, "forms.AuditContent.filters.params", {}),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewContentAudit))
