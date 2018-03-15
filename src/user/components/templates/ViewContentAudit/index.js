import { Component } from 'react';
import { connect } from 'react-redux'
import {
  AUDIT_CONTENT_REQUEST,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import {
} from 'user/components/partials'
import { SocialLogin } from 'shared/components/partials'
import { SelectChannelGrouping, SelectWebpageDetailsSet } from 'user/components/groups'
import { AnalyticsFilters, ContentAuditTable } from 'user/components/partials'
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
  }

  componentWillMount() {
    const {filters} = this.props
    if (!filters || !filters.startDate) {
      //initialize the filters with just week start date, which is default for GA anyways
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
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value}) //only for social login so far
  }

  // filter should be object, keys being params that will be overwritten for the analytics filters
  setFilters(filtersToMerge, options = {}) {
    formActions.setParams("AuditContent", "filters", filtersToMerge)
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

    // don't use props, since could be out of date (if just changed filters before props could get propogated)
    const filters = store.getState().forms.AuditContent.filters.params
    const dataset = "contentAudit-all"
    const lastUsedFilters = Helpers.safeDataPath(this.props.contentAudit, `lastUsedFilters`, {})
    const {lastUsedDataset} = this.props.datasetParams

    if (lastUsedDataset !== dataset) {
      //big enough change, merits resetting to defaults
      let filtersToMerge = analyticsHelpers.getDatasetDefaultFilters(dataset)

      // make sure frontend is up to date
      this.setFilters(filtersToMerge)
    }

    formActions.setParams("AuditContent", "dataset", {lastUsedDataset: dataset})

    this.props.auditSite({}, dataset, cb, onFailure)


    const relevantProperties = ["startDate", "endDate", "channelGrouping", "websiteId", "profileId"]
  }

  render () {
    const {pending} = this.state
    const {googleAccounts, filters, analytics, datasetParams} = this.props
    const currentGoogleAccount = googleAccounts && googleAccounts[0]
    const dataset = "contentAudit-all"
    const targetApis = analyticsHelpers.whomToAsk(dataset)

    //wait to finish initializing store at least
    if (!filters) {
      return <Icon name="spinner"/>
    }

    const query = new URLSearchParams(document.location.search)
    const webpageQueryValue = query.get("webpage")

    return (
      <div className={classes.viewAnalytics}>
        <h1>Content Audit</h1>

        <AnalyticsFilters
          togglePending={this.togglePending}
          setAnalyticsFilters={this.setFilters}
          getAnalytics={this.auditSite}
          filters={filters}
        />

                  <Button
                    onClick={this.auditSite}
                    className={classes.twoColumns}
                  >
                    Audit site
                  </Button>

        <ContentAuditTable

        />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
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
    contentAudit: state.contentAudit,
    user: state.user,
    campaigns: state.campaigns,
    googleAccounts: Helpers.safeDataPath(state, "providerAccounts.GOOGLE", []).filter((account) => !account.unsupportedProvider),
    websites: state.websites,
    datasetParams: Helpers.safeDataPath(state, "forms.AuditContent.dataset.params", {}),
    filters: Helpers.safeDataPath(state, "forms.AuditContent.filters.params", {}),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewContentAudit))
