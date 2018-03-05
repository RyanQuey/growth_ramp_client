import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon, Card } from 'shared/components/elements'
import { PostCard, ProviderCard } from 'user/components/partials'
import { SET_CURRENT_PAGE, SET_CURRENT_MODAL  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import { DIMENSIONS_METRICS_FRIENDLY_NAME } from 'constants/analytics'
import {
  withRouter,
} from 'react-router-dom'
import {formActions} from 'shared/actions'
import analyticsHelpers from 'helpers/analyticsHelpers'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in Compose only
class AnalyticsTable extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.setCurrentPage = this.setCurrentPage.bind(this)
  }
  setCurrentPage(post) {
    this.props.setCurrentPage(post, this.props.items)

    //make sure utms are enabled if post has those utms
    let utmKeys = UTM_TYPES.map((t) => t.value)
    let utmFields = {}
    for (let i = 0; i < utmKeys.length; i++) {
      let key = utmKeys[i]
      utmFields[key] = post[key] ? true : false
    }

    formActions.setOptions(this.props.form, this.props.items, {[post.id]: {utms: utmFields}})
  }

  // when click on dimension column within a row
  chooseDimensionOnRow (dimensionValue, e) {
    e && e.preventDefault()
    const {baseOrganization, location} = this.props

    if (baseOrganization === "website-overview") {
      //channelGroupings are the row dimensions, so setting that
      const dimensionFilter = {
        dimensionName: `ga:channelGrouping`,
        operator: "EXACT",
        expressions: [dimensionValue]
      }

      const clearOtherFilters = true
      this.props.updateDimensionFilter(dimensionFilter, clearOtherFilters)
      this.props.history.push(`/analytics/landing-pages`)

    } else if (baseOrganization === "landing-pages") {
      const encodedUrl = encodeURIComponent(dimensionValue)
      this.props.history.push(`/analytics/landing-pages?webpage=${encodedUrl}`)
    }

    this.props.getAnalytics()
  }

  render() {
    const {baseOrganization, analytics, filters, location, tableDatasetParams, websites} = this.props
    const tableDataset = analyticsHelpers.getDataset("table", filters, baseOrganization, tableDatasetParams)
    const {gscStatus, gscUrl, targetApis} = analyticsHelpers.getExternalApiInfo(filters.websiteUrl, tableDataset, websites)
    const theseAnalytics = analytics[tableDataset]

    if (!analytics) {
      return null
    }

    let headers, rows, totals
    const webpageQuery = new URLSearchParams(location.search).get("webpage")

    if (theseAnalytics && Object.keys(theseAnalytics).length) {
      headers = [
        ...theseAnalytics.columnHeader.dimensions,
        ...theseAnalytics.columnHeader.metrics
      ].map((header) => Object.assign({}, header,
        {title: DIMENSIONS_METRICS_FRIENDLY_NAME[header.name]}
      ))

      rows = theseAnalytics.rows
      // GSC doesn't sort for us, so we sort and therefore have to paginate ourselves
      if (targetApis.includes("GoogleSearchConsole")) {
        rows = analyticsHelpers.paginateManually(rows, filters.page, filters.pageSize)
      }

      totals = Helpers.safeDataPath(theseAnalytics, "data.totals.0.values")
    }

    const orderByFilter = filters && filters.orderBy

    const haveGSCAccess = gscStatus.status === "ready"
    if ((targetApis.includes("GoogleSearchConsole") && !haveGSCAccess) || !theseAnalytics || !Object.keys(theseAnalytics).length) {
      return null
    }

    return (
      <div className={`${classes.container} ${this.props.hidden ? classes.hidden : ""}`}>

        {false && !haveGSCAccess ? (
          <div>{gscStatus.message}</div>
        ) : (
          <div>
            <Flexbox className={classes.table} direction="column" align="center">
              <Flexbox className={` ${classes.tableHeader}`} direction="row">
                {headers.map((header, index) =>
                  <div key={header.name} className={`${classes[`column${index +1}`]}`}>
                    <a onClick={this.props.setOrderBy.bind(null, header.name)}>{header.title}</a>&nbsp;
                    {orderByFilter.fieldName === header.name && (
                      <Icon name={orderByFilter.sortOrder === "DESCENDING" ? "caret-down" : "caret-up"}/>
                    )}
                  </div>
                )}
              </Flexbox>

              {totals &&
                <Flexbox
                  className={`${classes.tableRow} ${classes.oddRow} ${classes.totalsRow}`}
                  align="center"
                >
                  <div className={`${classes[`column1`]}`}>Totals</div>

                  {totals.map((value, index) => {
                    const correspondingHeader = theseAnalytics.columnHeader.metrics[index]
                    const valueType = correspondingHeader.type
                    const totalType = ["INTEGER"].includes(valueType) ? "total" : "average"

                    return <div key={correspondingHeader.name} className={`${classes[`column${index +2}`]}`}>{value} ({totalType})</div>
                  })}
                </Flexbox>
              }

              {rows.map((row, index) => {
                const alternatingClass = (index % 2) == 1 ? "oddRow" : "evenRow"

                return (
                  <Flexbox
                    key={row.dimensions[0]}
                    className={`${classes.tableRow} ${classes[alternatingClass]}`}
                    align="center"
                  >
                    {row.dimensions.map((value, index) => {
                      if (baseOrganization === "website-overview" || (baseOrganization === "landing-pages" && !webpageQuery)) {
                        return <a key={index} onClick={this.chooseDimensionOnRow.bind(this, value)} className={`${classes[`column${index +1}`]}`}>{value}</a>
                      } else if (baseOrganization === "landing-pages" && webpageQuery){
                        return <div key={index} className={`${classes[`column${index +1}`]}`}>{value}</div>
                      }
                    })}

                    {row.metrics[0].values.map((value, index) =>
                      <div key={index} className={`${classes[`column${index +1 + row.dimensions.length}`]}`}>{value}</div>
                    )}
                  </Flexbox>
                )
              })}
            </Flexbox>
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    //really is campaign posts params
    currentPage: state.currentPage,
    analytics: state.analytics,
    filters: Helpers.safeDataPath(state, "forms.Analytics.filters.params"),
    websites: state.websites,
    providerAccounts: state.providerAccounts,
    tableDatasetParams: Helpers.safeDataPath(state, "forms.Analytics.tableDataset.params", {}),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    setCurrentPage: (payload, items, options) => dispatch({type: SET_CURRENT_PAGE, payload, options}),

  }
}

const ConnectedAnalyticsTable = withRouter(connect(mapStateToProps, mapDispatchToProps)(AnalyticsTable))
export default ConnectedAnalyticsTable

