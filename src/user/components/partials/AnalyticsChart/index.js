import { Component } from 'react';
import { connect } from 'react-redux'
import { Line } from 'react-chartjs-2'
import { Flexbox, Button, Icon, Card } from 'shared/components/elements'
import { PostCard, ProviderCard } from 'user/components/partials'
import { SET_CURRENT_PAGE, SET_CURRENT_MODAL  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import { DIMENSIONS_METRICS_FRIENDLY_NAME } from 'constants/analytics'
import {formActions} from 'shared/actions'
import analyticsHelpers from 'helpers/analyticsHelpers'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in Compose only
class AnalyticsChart extends Component {
  constructor() {
    super()

    this.state = {
    }

  }

  render() {
    const {dataset, analytics, filters, chartFilters} = this.props
    const theseAnalytics = analytics[dataset]
    const lastUsedFilters = Helpers.safeDataPath(this.props.analytics, `chart-line-time.lastUsedFilters`, {})

console.log(analytics, dataset);
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

    const xAxisData = analyticsHelpers.getXAxisData(lastUsedFilters)
    const {rangeArray, unit, step} = xAxisData
    const labels = analyticsHelpers.getHistogramLabels(xAxisData, rows)

    const metricSets = theseAnalytics.columnHeader.metrics.map((metric, index) => (
      {
        label: DIMENSIONS_METRICS_FRIENDLY_NAME[metric.name], //for the legend
        data: rows.map((row) => row.metrics[0].values[index]),
        fill: true,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
      }

    ))

    const dataProp = {
      labels,
      datasets: metricSets //add a dataset to add an additional line to the graph (could add another metric for example)
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

