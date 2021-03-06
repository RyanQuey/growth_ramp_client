import { Component } from 'react';
import { connect } from 'react-redux'
import {
  GET_ANALYTICS_REQUEST,
  FETCH_ALL_GA_ACCOUNTS_REQUEST, //does gsc too actually, any api with websites
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import {
} from 'user/components/partials'
import { PaginationMenu, SocialLogin } from 'shared/components/partials'
import { SelectChannelGrouping, SelectWebpageDetailsSet } from 'user/components/groups'
import { AnalyticsFilters, AnalyticsTable, AnalyticsChart, AuditSiteSelector } from 'user/components/partials'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
import {formActions, alertActions} from 'shared/actions'
import {
  withRouter,
} from 'react-router-dom'
import analyticsHelpers from 'helpers/analyticsHelpers'
import classes from './style.scss'

class ViewAnalytics extends Component {
  constructor() {
    super()
    this.state = {
      pending: false,
    }

    this.togglePending = this.togglePending.bind(this)
    this.setAnalyticsFilters = this.setAnalyticsFilters.bind(this)
    this.resetPagination = this.resetPagination.bind(this)
    this.getAnalytics = this.getAnalytics.bind(this)
    this.refreshGAAccounts = this.refreshGAAccounts.bind(this)
    this.getChartAnalytics = this.getChartAnalytics.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onPageSizeChange = this.onPageSizeChange.bind(this)
    this.updateDimensionFilter = this.updateDimensionFilter.bind(this)
    this.setOrderBy = this.setOrderBy.bind(this)
    this.refreshUnlessGSCOnly = this.refreshUnlessGSCOnly.bind(this)
    this.configureWebsites = this.configureWebsites.bind(this)
  }

  componentWillMount() {
    const {filters} = this.props
    if (!filters || !filters.startDate) {
      //initialize the filters with just week start date, which is default for GA anyways
      const yesterday = moment().subtract(1, "day")
      const options = {
        startDate: yesterday.clone().subtract(7, "days").format("YYYY-MM-DD"),
        endDate: yesterday.format("YYYY-MM-DD"),
        orderBy: {
          fieldName: "ga:pageviews", sortOrder: "DESCENDING"
        },
      }

      this.resetPagination(options)
    }

    if (this.props.currentWebsite) {
      // this will end getting analytics if coming from other page, which is necessary, but not if GR landing page was the dashboard itself (in which case, once everything is ready, will get analytics anyways)
      this.getAnalytics()
    }
  }

  componentWillReceiveProps(props) {
    const oldBaseOrganization = Helpers.safeDataPath(this.props, "match.params.baseOrganization")
    const newBaseOrganization = Helpers.safeDataPath(props, "match.params.baseOrganization")

    // currently this works since GSC not used when first changing baseOrganization
    if (props.currentWebsite && oldBaseOrganization !== newBaseOrganization) {
      //clear the extras, leave lastUsedTableDataset
      formActions.setParams("Analytics", "tableDataset", {rowsBy: null, columnSets: null, key: null})

      this.getAnalytics(null, newBaseOrganization)
    }

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

  // use eg when checking if should refresh chart, since that uses same data if GSC is being called only right now
  refreshUnlessGSCOnly () {
    const {filters} = this.props
    const baseOrganization = Helpers.safeDataPath(this.props, "match.params.baseOrganization")
    const dataset = analyticsHelpers.getDataset("table", filters, baseOrganization)
    const targetApis = analyticsHelpers.whomToAsk(dataset)

    if (targetApis.length !== 1 || targetApis[0] !== "GoogleSearchConsole") {
      this.getAnalytics()
    }
  }

  onPageSizeChange(value) {
    this.setAnalyticsFilters({pageSize: value}, {skipResetPagination: true})
    this.refreshUnlessGSCOnly()
  }

  onPageChange(value) {
    //NOTE technically, pageToken is arbitrary string, only retrievable for next page (see GA docs). But, for most part is just the zero-based row index of last row currently shown.
    //If ever get problems, just disallow jumping pages
    this.setAnalyticsFilters({page: value}, {skipResetPagination: true})

    this.refreshUnlessGSCOnly()
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value}) //only for social login so far
  }

  setOrderBy(headerName, e, options = {}) {
    e && e.preventDefault()

    let orderBy = {
      fieldName: headerName,
      sortOrder: "DESCENDING",
    }

    //if already ordering by this column, reverse direction
    const currentOrderBy = Helpers.safeDataPath(this.props, `filters.orderBy`, {})
    if (currentOrderBy.fieldName === headerName) {
      orderBy.sortOrder = currentOrderBy.sortOrder === "DESCENDING" ? "ASCENDING" : "DESCENDING"
    }

    this.setAnalyticsFilters({orderBy})

    // check if should refresh
    !options.skipRefresh && this.refreshUnlessGSCOnly()

    // check if should sort
    // can't get filters from props, since all this gets called before props gets refreshed
    const filters = Helpers.safeDataPath(store.getState(), "forms.Analytics.filters.params", {})
    const baseOrganization = Helpers.safeDataPath(this.props, "match.params.baseOrganization")
    const dataset = analyticsHelpers.getDataset("table", filters, baseOrganization)
console.log(baseOrganization, filters, dataset);
    const targetApis = analyticsHelpers.whomToAsk(dataset)

    if (targetApis.includes("GoogleSearchConsole")) {
      // don't get if only GSC, since we already ahve all of it!
      analyticsHelpers.sortGSCRows()
    }
  }

  // filter should be object, keys being params that will be overwritten for the analytics filters
  setAnalyticsFilters(filtersToMerge, options = {}) {
    if (!options.skipResetPagination && Object.keys(filtersToMerge).every((filterKey) => !["page", "pageSize"].includes(filterKey))) {
      //unless pagination is the thing getting changed, reset pagination
      this.resetPagination()
    }

    formActions.setParams("Analytics", "filters", filtersToMerge)
  }

  //mostly run when enough other filters change that pagination, orderBy, that kind of ting needs to just be reset
  resetPagination (options){
    const defaults = {
      //could make this plural, so can sort by multiple. but for now, just support sorting by one
      page: 1,
    }

    const filtersToReset = Object.assign({}, defaults, options)
    this.setAnalyticsFilters(filtersToReset)
  }

  //pass in undefined or null or false to remove all dimension filters
  //pass in expressions as undefined or null or false to remove all dimension filters to remove a certain filter for the provided dimensionFilter.dimensionName
  //assumption is that each filter will have a unique dimensionName. Might not always be true in future, but assume for now, can add option for that later
  updateDimensionFilter (dimensionFilter, clearOtherFilters = false) {
    const {filters} = this.props
    if (!dimensionFilter) {
      //remove all dimension filters
      this.setAnalyticsFilters({dimensionFilterClauses: undefined})
      return
    }

    let dimensionFilterClauses = !clearOtherFilters && filters.dimensionFilterClauses ? filters.dimensionFilterClauses : {operator: "AND", filters: []}

    const targetDimensionIndex = dimensionFilterClauses.filters.findIndex((filterClause) => filterClause.dimensionName === dimensionFilter.dimensionName)
    if (!dimensionFilter.expressions || !dimensionFilter.expressions.length) {
      //remove that filter if exists
      if (targetDimensionIndex !== -1) {
        dimensionFilterClauses.filters.splice(targetDimensionIndex, 1)
      }

    } else {
      //replace that filter if exists or add that filter
      if (targetDimensionIndex === -1) {
        dimensionFilterClauses.filters.push(dimensionFilter)
      } else {
        dimensionFilterClauses.filters.splice(targetDimensionIndex, 1, dimensionFilter)
      }
    }
    this.setAnalyticsFilters({dimensionFilterClauses})
  }

  // gets analytics for table, sometimes triggers for chart too
  // newBaseOrganization should be passed in if called in componentWillReceiveProps so the right one gets passed in (otherwise, will take from old props)
  getAnalytics (e, newBaseOrganization) {
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

    // don't use props, since could be out of date (if just changed filters before props could get propogated)
    const filters = store.getState().forms.Analytics.filters.params
    const baseOrganization = newBaseOrganization || Helpers.safeDataPath(this.props, "match.params.baseOrganization")
    const tableDataset = analyticsHelpers.getDataset("table", filters, baseOrganization)
    const lastUsedFilters = Helpers.safeDataPath(this.props.analytics, `${baseOrganization}.lastUsedFilters`, {})
    const {lastUsedTableDataset} = this.props.tableDatasetParams

    if (lastUsedTableDataset !== tableDataset) {
      //big enough change, merits resetting to defaults
      let filtersToMerge = analyticsHelpers.getDatasetDefaultFilters(tableDataset, newBaseOrganization)

      // make sure frontend is up to date
      this.setAnalyticsFilters(filtersToMerge)
    }

    formActions.setParams("Analytics", "tableDataset", {lastUsedTableDataset: tableDataset})

    this.props.getAnalytics({}, tableDataset, cb, onFailure)


    //check if chart also needs to be updated
    const relevantProperties = ["startDate", "endDate", "channelGrouping", "websiteId", "profileId"]

    if (
      !_.isEqual(
        _.pick(this.props.filters, relevantProperties),
        _.pick(lastUsedFilters, relevantProperties)
      ) ||
      lastUsedTableDataset !== tableDataset
    ) {
      this.getChartAnalytics()
    }
  }

  configureWebsites (e) {
    e && e.preventDefault()

    this.props.history.push("/settings/websites")
  }

  getChartAnalytics(e) {
    e && e.preventDefault()
    //TODO set filters to store, and then use in saga
    formActions.formPersisted("Analytics", "chartFilters")

    const baseOrganization = Helpers.safeDataPath(this.props, "match.params.baseOrganization")
    const dataset = analyticsHelpers.getDataset("chart", this.props.filters, baseOrganization)

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
    this.props.getAnalytics({filters: this.props.chartFilters}, dataset, cb, onFailure)

  }

  render () {
    const {pending} = this.state
    const {currentWebsite, filters, analytics, tableDatasetParams, websites} = this.props
    const baseOrganization = Helpers.safeDataPath(this.props, "match.params.baseOrganization")
    const tableDataset = analyticsHelpers.getDataset("table", filters, baseOrganization)
    const targetApis = analyticsHelpers.whomToAsk(tableDataset)

    //wait to finish initializing store at least
    if (!filters) {
      return <Icon name="spinner"/>
    }

    //pagination stuff
    const lastUsedFilters = Helpers.safeDataPath(analytics, `${tableDataset}.lastUsedFilters`, {})
//TODO not updating lastUsedFilters well, at least for now
//but only used for pagination up to this point, so can just use filters data, since we're not keeping last use and current filters different yet.
    const currentPage = filters.page || 1
    const currentPageSize = filters.pageSize || 10

    const theseAnalytics = analytics[tableDataset] || {}
    let totalRecords
    if (targetApis.length === 1 && targetApis[0] === "GoogleSearchConsole") {
      totalRecords = Helpers.safeDataPath(theseAnalytics, "rows", []).length

    } else {
      totalRecords = Helpers.safeDataPath(theseAnalytics, `data.rowCount`, 0)

    }

    const query = new URLSearchParams(document.location.search)
    const webpageQueryValue = query.get("webpage")

    return (
      <div className={classes.viewAnalytics}>
        <h1>Analytics</h1>

        <div>
          {currentWebsite ? currentWebsite.name : "No websites yet; configure websites by clicking below to get started"}
        </div>

        <div className={classes.websiteSettings}>
          {Object.keys(websites).length > 0 ? (
            <div>
              <AuditSiteSelector
                togglePending={this.togglePending}
              />

              <a onClick={this.configureWebsites}>Configure Websites</a>
            </div>
          ) : (
            <a onClick={this.configureWebsites}>Add a Website</a>
          )}
        </div>

        <AnalyticsFilters
          togglePending={this.togglePending}
          baseOrganization={baseOrganization}
          setAnalyticsFilters={this.setAnalyticsFilters}
          getAnalytics={this.getAnalytics}
          filters={filters}
          refreshGAAccounts={this.refreshGAAccounts}
        />

        <AnalyticsChart
          baseOrganization={baseOrganization}
          dataset={"chart-line-time"}
          setAnalyticsFilters={this.setAnalyticsFilters}
          getChartAnalytics={this.getChartAnalytics}
        />

        {currentWebsite && baseOrganization === "landing-pages" && !webpageQueryValue &&
          <SelectChannelGrouping
            updateDimensionFilter={this.updateDimensionFilter}
            getAnalytics={this.getAnalytics}
            resetPagination={this.resetPagination}
          />
        }

        {currentWebsite && baseOrganization === "landing-pages" && webpageQueryValue &&
          <SelectWebpageDetailsSet
            updateDimensionFilter={this.updateDimensionFilter}
            getAnalytics={this.getAnalytics}
            resetPagination={this.resetPagination}
            setOrderBy={this.setOrderBy}
            webpageQueryValue={webpageQueryValue}
          />
        }

        <AnalyticsTable
          baseOrganization={baseOrganization}
          setAnalyticsFilters={this.setAnalyticsFilters}
          getAnalytics={this.getAnalytics}
          updateDimensionFilter={this.updateDimensionFilter}
          setOrderBy={this.setOrderBy}
        />

        {currentWebsite && (
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
    fetchAllGAAccounts: (payload, cb, onFailure) => dispatch({type: FETCH_ALL_GA_ACCOUNTS_REQUEST, payload, cb, onFailure}),
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
    websites: state.websites,
    currentWebsite: state.currentWebsite,
    tableDatasetParams: Helpers.safeDataPath(state, "forms.Analytics.tableDataset.params", {}),
    filters: Helpers.safeDataPath(state, "forms.Analytics.filters.params", {}),
    chartFilters: Helpers.safeDataPath(state, "forms.Analytics.chartFilters.params", {}),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewAnalytics))
