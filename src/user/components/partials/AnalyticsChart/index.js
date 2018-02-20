import { Component } from 'react';
import { connect } from 'react-redux'
import { Line } from 'react-chartjs-2'
import { Flexbox, Button, Icon, Card } from 'shared/components/elements'
import { PostCard, ProviderCard } from 'user/components/partials'
import { SET_CURRENT_PAGE, SET_CURRENT_MODAL  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import { DIMENSIONS_METRICS_FRIENDLY_NAME } from 'constants/analytics'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in Compose only
class AnalyticsChart extends Component {
  constructor() {
    super()

    this.state = {
    }

  }

  //currently based solely on dates of data given
  //goal is to have 4-6 labels
  getXAxisLabels({startDate, endDate}){
    const start = moment(startDate)
    const end = moment(endDate)
    //diff in days
    const filterLength = end.diff(start) / 1000 / 60 / 60 / 24
    const range = moment.range(start, end)

    let rangeArr, unit, step
    if (filterLength < 7) {
      unit = "day"
      step = 1

    } else if (filterLength < 13) {
      unit = "day"
      step = 2

    } else if (filterLength < 49) {
      unit = "week"
      step = 1

    } else if (filterLength < 100) {
      unit = "week"
      step = 2

    } else if (filterLength < 180) {
      unit = "month"
      step = 1

    } else if (filterLength < 365) {
      unit = "month"
      step = 2

    } else if (filterLength < 730) { //2 years
      unit = "month"
      step = 6

    } else if (filterLength < 730) { //4 years
      unit = "year"
      step = 1

    } else {
      unit = "year"
      step = 2

    }
    rangeArr = Array.from(range.by(unit, {step: step}))

    return {rangeArr, unit, step}
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

    const xAxisLabels = this.getXAxisLabels(filters)

    const dataProp = {
      labels,
      datasets: [
        {
          data:
        }
      ]
    }

    return (
      <div className={`${classes.container} ${this.props.hidden ? classes.hidden : ""}`}>
        <Line data={dataProp} />
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

const ConnectedAnalyticsChart = connect(mapStateToProps, mapDispatchToProps)(AnalyticsChart)
export default ConnectedAnalyticsChart

