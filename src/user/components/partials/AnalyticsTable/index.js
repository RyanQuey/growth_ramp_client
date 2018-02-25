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
    this.setOrderBy = this.setOrderBy.bind(this)
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

      this.props.updateDimensionFilter(dimensionFilter)
      this.props.history.push(`/analytics/landing-pages`)

    } else if (baseOrganization === "landing-pages") {
      const encodedUrl = encodeURIComponent(dimensionValue)
      this.props.history.push(`/analytics/landing-pages?webpage=${encodedUrl}`)
    }

    this.props.getAnalytics()
  }

  setOrderBy(headerName, e) {
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

    this.props.setAnalyticsFilters({orderBy})
    this.props.getAnalytics()
  }

  render() {
    const {baseOrganization, analytics, filters, location} = this.props
    const tableDataset = analyticsHelpers.getDataset("table", filters, baseOrganization)
    const theseAnalytics = analytics[tableDataset]

    if (!analytics || !theseAnalytics) {
      return null
    }

    const webpageQuery = new URLSearchParams(location.search).get("webpage")

    const headers = [
      ...theseAnalytics.columnHeader.dimensions,
      ...theseAnalytics.columnHeader.metrics
    ].map((header) => Object.assign({}, header,
      {title: DIMENSIONS_METRICS_FRIENDLY_NAME[header.name]}
    ))

    const rows = theseAnalytics.rows
    const totals = Helpers.safeDataPath(theseAnalytics, "data.totals.0.values")
    const orderByFilter = filters && filters.orderBy

    return (
      <div className={`${classes.container} ${this.props.hidden ? classes.hidden : ""}`}>

        <Flexbox className={classes.table} direction="column" align="center">
          <Flexbox className={` ${classes.tableHeader}`} direction="row">
            {headers.map((header, index) =>
              <div key={header.name} className={`${classes[`column${index +1}`]}`}>
                <a onClick={this.setOrderBy.bind(this, header.name)}>{header.title}</a>&nbsp;
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

                return <div key={index} className={`${classes[`column${index +2}`]}`}>{value} ({totalType})</div>
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
    )
  }
}

const mapStateToProps = state => {
  return {
    //really is campaign posts params
    currentPage: state.currentPage,
    analytics: state.analytics,
    filters: Helpers.safeDataPath(state, "forms.Analytics.filters.params"),
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

