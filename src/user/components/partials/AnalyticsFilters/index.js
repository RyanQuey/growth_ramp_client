import { Component } from 'react';
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import {
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
  SET_ANALYTICS_FILTER,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { AuditSiteSelector } from 'user/components/partials'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
import { TIME_RANGE_OPTIONS, } from 'constants/analytics'
import {formActions, alertActions} from 'shared/actions'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'

class AnalyticsFilters extends Component {
  constructor() {
    super()
    this.state = {
      pending: true,
    }

    this.selectFilterOption = this.selectFilterOption.bind(this)
    this.handleCalendarClick = this.handleCalendarClick.bind(this)
  }

  componentDidMount() {
    // TODO on mount check if website has the webpage we're looking for, rather than just clearing
    this.props.history.push(this.props.location.pathname)

    // need to have availableWebsites
    if (!this.props.availableWebsites.gaSites) {
      this.props.refreshGAAccounts()
    }
  }
  componentWillReceiveProps(props) {
    if (Helpers.safeDataPath(props, "currentWebsite.id") !== Helpers.safeDataPath(this.props, "currentWebsite.id")) {
      this.props.getAnalytics()
    }
  }

  timeRangeOptions () {
    //default is first option, one week, which is what GA defaults to
    const yesterday = moment().subtract(1, "day")
    return [
      {
        label: "Custom",
        value: {}, //will default to week view, but if choosing with calendar will go to this
      },
      {
        label: "Past 7 Days",
        value: {
          startDate: yesterday.clone().subtract(7, "days").format("YYYY-MM-DD"),
          endDate: yesterday.format("YYYY-MM-DD"),
        },
      },
      {
        label: "Past 30 Days",
        value: {
          startDate: yesterday.clone().subtract(30, "days").format("YYYY-MM-DD"),
          endDate: yesterday.format("YYYY-MM-DD"),
        },
      },
      {
        label: "All",
        value: {
          startDate: "2005-01-01", //GA started, so can't go before this
          endDate: yesterday.format("YYYY-MM-DD"),
        }
      },
    ]
  }

  selectFilterOption (option) {
    this.props.setAnalyticsFilters(option.value)
    this.props.getAnalytics()
  }

  handleCalendarClick (param, dateTime) {

    this.props.setAnalyticsFilters({[param]: dateTime.format("YYYY-MM-DD")})
    this.props.getAnalytics()
  }

  render () {
    const {pending} = this.state
    const {dirty, filters, currentWebsite} = this.props

    if (!filters || !currentWebsite) {
      return null
    }
    const {websiteId, profileId, startDate, endDate, dimensionFilterClauses} = filters

    //set by function so date will refresh, in case goes past midnight and they didn't refresh browser or something
    const timeRangeOptions = this.timeRangeOptions()
    const currentTimeRangeOption = timeRangeOptions.find((option) => option.value.startDate === startDate)

    return (
      <Form className={classes.filtersForm} onSubmit={this.props.getAnalytics}>
          <div className={classes.datetimeFilters}>
            <Flexbox>
              <div>
                <div>Start Date</div>
                <DatePicker
                  selected={startDate && moment(startDate)}
                  onChange={this.handleCalendarClick.bind(this, "startDate")}
                  isClearable={false}
                  todayButton="Today"
                  dateFormatCalendar="MMM D, YYYY"
                  dateFormat="MMM D, YYYY"
                  calendarClassName={classes.reactDatepicker}
                  className={classes.datePickerInput}
                  placeholderText={startDate}
                />
              </div>

              <div>
                <div>End Date</div>
                <DatePicker
                  selected={endDate && moment(endDate)}
                  onChange={this.handleCalendarClick.bind(this, "endDate")}
                  isClearable={false}
                  todayButton="Today"
                  dateFormatCalendar="MMM D, YYYY"
                  dateFormat="MMM D, YYYY"
                  calendarClassName={classes.reactDatepicker}
                  className={classes.datePickerInput}
                  placeholderText={endDate}
                />
              </div>

              <div className={classes.timeRangeSelect}>
                <div>&nbsp;</div>
                <Select
                  options={timeRangeOptions}
                  onChange={this.selectFilterOption}
                  currentOption={currentTimeRangeOption || timeRangeOptions[0]}
                  name="timerange"
                />
              </div>

            </Flexbox>

            {false && <Button type="submit" pending={pending} disabled={!profileId || !dirty}>Submit</Button>}
          </div>
      </Form>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllGAAccounts: (payload, cb, onFailure) => dispatch({type: FETCH_ALL_GA_ACCOUNTS_REQUEST, payload, cb, onFailure}),

  }
}

const mapStateToProps = state => {
  return {
    currentWebsite: state.currentWebsite,
    availableWebsites: state.availableWebsites,
    dirty: Helpers.safeDataPath(state, "forms.Analytics.filters.dirty"),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AnalyticsFilters))
