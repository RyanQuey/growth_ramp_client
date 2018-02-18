import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon, Card } from 'shared/components/elements'
import { PostCard, ProviderCard } from 'user/components/partials'
import { SET_CURRENT_PAGE, SET_CURRENT_MODAL  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import { METRICS_FRIENDLY_NAME } from 'constants/analytics'
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

  render() {
    const {dataset, analytics} = this.props
    const theseAnalytics = analytics[dataset]

    if (!analytics || !theseAnalytics) {
      return null
    }

    const headers = [
      ...theseAnalytics.columnHeader.dimensions,
      ...theseAnalytics.columnHeader.metrics.map((entry) => METRICS_FRIENDLY_NAME[entry.name])
    ].map((header) => header.replace("ga:", "").titleCase())

    const rows = theseAnalytics.rows

    return (
      <div className={`${classes.container} ${this.props.hidden ? classes.hidden : ""}`}>

        <Flexbox className={classes.table} direction="column" align="center">
          <Flexbox className={` ${classes.tableHeader}`} direction="row">
            {headers.map((header, index) =>
              <div key={header} className={`${classes[`column${index +1}`]}`}>{header}</div>
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

