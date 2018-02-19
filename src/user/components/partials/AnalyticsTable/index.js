import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon, Card } from 'shared/components/elements'
import { PostCard, ProviderCard } from 'user/components/partials'
import { SET_CURRENT_PAGE, SET_CURRENT_MODAL  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import { DIMENSIONS_METRICS_FRIENDLY_NAME } from 'constants/analytics'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in Compose only
class AnalyticsTable extends Component {
  constructor() {
    super()

    this.state = {
      currentPage: null, //will be an index
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
console.log(currentOrderBy, headerName);

    this.props.setAnalyticsFilters({orderBy})
    this.props.getAnalytics()
  }

  render() {
    const {dataset, analytics, filters} = this.props
    const theseAnalytics = analytics[dataset]

    if (!analytics || !theseAnalytics) {
      return null
    }

    const headers = [
      ...theseAnalytics.columnHeader.dimensions,
      ...theseAnalytics.columnHeader.metrics
    ].map((header) => Object.assign({}, header,
      {title: DIMENSIONS_METRICS_FRIENDLY_NAME[header.name]}
    ))

    const rows = theseAnalytics.rows
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

          {rows.map((row, index) => {
            const alternatingClass = (index % 2) == 1 ? "oddRow" : "evenRow"

            const values = [
              ...row.dimensions,
              ...row.metrics[0].values.map((value) =>
                parseFloat(value) ? Math.round(value * 100) / 100 : value
              )
            ]

            return (
              <Flexbox
                key={row.dimensions[0]}
                className={`${classes.providerContainer} ${classes[alternatingClass]}`}
                align="center"
              >
                {values.map((value, index) =>
                  <div key={index} className={`${classes[`column${index +1}`]}`}>{value}</div>
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

const ConnectedAnalyticsTable = connect(mapStateToProps, mapDispatchToProps)(AnalyticsTable)
export default ConnectedAnalyticsTable

