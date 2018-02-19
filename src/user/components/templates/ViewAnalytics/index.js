import { Component } from 'react';
import { connect } from 'react-redux'
import {
  GET_ANALYTICS_REQUEST,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import {
} from 'user/components/partials'
import { SocialLogin } from 'shared/components/partials'
import { AnalyticsFilters, AnalyticsTable } from 'user/components/partials'
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
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value}) //only for social login so far
  }

  // filter should be object, keys being params that will be overwritten for the analytics filters
  setAnalyticsFilters(filter) {
    formActions.setParams("Analytics", "filters", filter)
  }
  componentWillMount() {
    const {filters} = this.props
    if (!filters || !filters.startDate) {
      //initialize the filters with just week start date, which is default for GA anyways
      this.setAnalyticsFilters({
        startDate: moment().subtract(7, "days").format("YYYY-MM-DD"),
        endDate: moment().format("YYYY-MM-DD"),
        //could make this plural, so can sort by multiple. but for now, just support sorting by one
        orderBy: {
          fieldName: "ga:pageviews", sortOrder: "DESCENDING"
        }
      })
    }
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
    const dataset = Helpers.safeDataPath(this.props, "match.params.dataset")
    this.props.getAnalytics({}, dataset, cb, onFailure)
  }


  render () {
    const {pending} = this.state
    const {googleAccounts} = this.props
    const currentGoogleAccount = googleAccounts && googleAccounts[0]
    //getting dataset/what the analytics dashboard view and filters are on this component.
    //For now, can do it all from the path, but might have to change later
    const dataset = Helpers.safeDataPath(this.props, "match.params.dataset")

    return (
      <div>
        <h1>Analytics</h1>

        <SocialLogin
          pending={this.state.pending}
          togglePending={this.togglePending}
          providers={_.pick(PROVIDERS, "GOOGLE")}
        />
        {currentGoogleAccount ? (
          <AnalyticsFilters
            togglePending={this.togglePending}
            dataset={dataset}
            setAnalyticsFilters={this.setAnalyticsFilters}
            getAnalytics={this.getAnalytics}
          />
        ) : (
          <div/>
        )}

        <AnalyticsTable
          dataset={dataset}
          setAnalyticsFilters={this.setAnalyticsFilters}
          getAnalytics={this.getAnalytics}
        />
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
    user: state.user,
    campaigns: state.campaigns,
    googleAccounts: Helpers.safeDataPath(state, "providerAccounts.GOOGLE", []).filter((account) => !account.unsupportedProvider),
    websites: state.websites,
    currentWebsiteId: Helpers.safeDataPath(state, "form.Analytics.filters.websiteId"),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewAnalytics))
