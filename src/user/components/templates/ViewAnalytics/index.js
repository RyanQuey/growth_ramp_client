import { Component } from 'react';
import { connect } from 'react-redux'
import {
  GET_ANALYTICS_REQUEST,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import {
} from 'user/components/partials'
import { PaginationMenu, SocialLogin } from 'shared/components/partials'
import { AnalyticsFilters, AnalyticsTable, AnalyticsChart } from 'user/components/partials'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
import {formActions, alertActions} from 'shared/actions'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'

class ViewAnalytics extends Component {
  constructor() {
    super()
    this.state = {
      pending: false,
    }


    this.togglePending = this.togglePending.bind(this)
    this.setAnalyticsFilters = this.setAnalyticsFilters.bind(this)
    this.getAnalytics = this.getAnalytics.bind(this)
    this.getChartAnalytics = this.getChartAnalytics.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onPageSizeChange = this.onPageSizeChange.bind(this)
  }

  componentWillMount() {
    const {filters} = this.props
    if (!filters || !filters.startDate) {
      //initialize the filters with just week start date, which is default for GA anyways
      const yesterday = moment().subtract(1, "day")
      this.setAnalyticsFilters({
        startDate: yesterday.clone().subtract(7, "days").format("YYYY-MM-DD"),
        endDate: yesterday.format("YYYY-MM-DD"),
        //could make this plural, so can sort by multiple. but for now, just support sorting by one
        orderBy: {
          fieldName: "ga:pageviews", sortOrder: "DESCENDING"
        },
        pageSize: 10,
        page: 1,
      })
    }
  }

  onPageSizeChange(value) {
    this.setAnalyticsFilters({pageSize: value})
  }

  onPageChange(value) {
    //NOTE technically, pageToken is arbitrary string, only retrievable for next page (see GA docs). But, for most part is just the zero-based row index of last row currently shown.
    //If ever get problems, just disallow jumping pages
    this.setAnalyticsFilters({page: value})
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value}) //only for social login so far
  }

  // filter should be object, keys being params that will be overwritten for the analytics filters
  setAnalyticsFilters(filter) {
    formActions.setParams("Analytics", "filters", filter)
  }

  getAnalytics(e) {
    e && e.preventDefault()
    //TODO set filters to store, and then use in saga
    formActions.formPersisted("Analytics", "filters")
    const cb = () => {
      this.setState({pending: false})
    }
    const onFailure = (err) => {
      this.setState({pending: false})
      alertActions.newAlert({
        title: "Failure to get analytics: ",
        level: "DANGER",
        message: err.message || "Unknown error",
        options: {timer: false},
      })
    }

    this.setState({pending: true})
    const tableDataset = Helpers.safeDataPath(this.props, "match.params.tableDataset")
    this.props.getAnalytics({}, tableDataset, cb, onFailure)

    //check if chart also needs to be updated
    const relevantProperties = ["startDate", "endDate", "defaultChannelGrouping", "websiteId", "profileId"]
    const lastUsedFilters = Helpers.safeDataPath(this.props.analytics, `${tableDataset}.lastUsedFilters`, {})
    if (_.pick(this.props.filters, relevantProperties) !== _.pick(lastUsedFilters, relevantProperties)) {
      this.getChartAnalytics()
    }
  }

  getChartAnalytics(e) {
    e && e.preventDefault()
    //TODO set filters to store, and then use in saga
    formActions.formPersisted("Analytics", "chartFilters")
    const cb = () => {
      this.setState({chartPending: false})
    }
    const onFailure = (err) => {
      this.setState({pending: false})
      alertActions.newAlert({
        title: "Failure to get analytics: ",
        level: "DANGER",
        message: err.message || "Unknown error",
        options: {timer: false},
      })
    }

    this.setState({chartPending: true})
    this.props.getAnalytics({filters: this.props.chartFilters}, "chart-line-time", cb, onFailure)

  }

  render () {
    const {pending} = this.state
    const {googleAccounts, filters, analytics} = this.props
    const currentGoogleAccount = googleAccounts && googleAccounts[0]
    //getting tableDataset/what the analytics dashboard view and filters are on this component.
    //For now, can do it all from the path, but might have to change later
    const tableDataset = Helpers.safeDataPath(this.props, "match.params.tableDataset")

    //wait to finish initializing store at least
    if (!filters) {
      return <Icon name="spinner"/>
    }

    //pagination stuff
    const lastUsedFilters = Helpers.safeDataPath(analytics, `${tableDataset}.lastUsedFilters`, {})
    const currentPage = lastUsedFilters.page || 1
    const currentPageSize = lastUsedFilters.pageSize || 10
    const lastRecordShown = Helpers.safeDataPath(analytics, `${tableDataset}.nextPageToken`) //could also use currentPage * currentPageSize
    const totalRecords = Helpers.safeDataPath(analytics, `${tableDataset}.data.rowCount`, 0)

    return (
      <div className={classes.viewAnalytics}>
        <h1>Analytics</h1>

        <SocialLogin
          pending={pending}
          togglePending={this.togglePending}
          providers={_.pick(PROVIDERS, "GOOGLE")}
        />
        {currentGoogleAccount ? (
          <AnalyticsFilters
            togglePending={this.togglePending}
            tableDataset={tableDataset}
            setAnalyticsFilters={this.setAnalyticsFilters}
            getAnalytics={this.getAnalytics}
          />
        ) : (
          <div />
        )}

        <AnalyticsChart
          tableDataset={tableDataset}
          chartDataset={"chart-line-time"}
          setAnalyticsFilters={this.setAnalyticsFilters}
          getChartAnalytics={this.getChartAnalytics}
        />

        <AnalyticsTable
          tableDataset={tableDataset}
          setAnalyticsFilters={this.setAnalyticsFilters}
          getAnalytics={this.getAnalytics}
        />

        {currentGoogleAccount && (
          <PaginationMenu
            onSubmit={this.getAnalytics}
            onPageSizeChange={this.onPageSizeChange}
            onPageChange={this.onPageChange}
            pageSizeParam={filters && filters.pageSize}
            pageParam={filters && filters.page}
            currentPage={currentPage}
            currentPageSize={currentPageSize}
            totalRecords={totalRecords}
            pending={pending}
          />
        )}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getAnalytics: (payload, dataset, cb, onFailure) => dispatch({
      type: GET_ANALYTICS_REQUEST,
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
    user: state.user,
    campaigns: state.campaigns,
    googleAccounts: Helpers.safeDataPath(state, "providerAccounts.GOOGLE", []).filter((account) => !account.unsupportedProvider),
    websites: state.websites,
    currentWebsiteId: Helpers.safeDataPath(state, "form.Analytics.filters.params.websiteId"),
    filters: Helpers.safeDataPath(state, "forms.Analytics.filters.params"),
    chartFilters: Helpers.safeDataPath(state, "forms.Analytics.chartFilters.params"),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewAnalytics))
