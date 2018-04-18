import { Component } from 'react';
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import {
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import analyticsHelpers from 'helpers/analyticsHelpers'
import {formActions, alertActions} from 'shared/actions'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'

class AuditCreator extends Component {
  constructor() {
    super()
    this.state = {
      pending: false,
      endDate: "",
      startDate: "",
    }

    this.selectFilterOption = this.selectFilterOption.bind(this)
    this.audit = this.audit.bind(this)
    this.timeRangeOptions = this.timeRangeOptions.bind(this)
  }

  componentWillMount() {
  }

  // TODO can run every time we receive new audits in props, and not every render
  timeRangeOptions () {
    //default is first option, one week, which is what GA defaults to
    const {audits} = this.props
    let options = []

    const allAudits = Object.keys(audits).map((id) =>  audits[id])
    const allBaseDates = allAudits.map((audit) => audit.baseDate || moment(audit.createdAt).subtract(1, "day").format())
    const latestAudit = analyticsHelpers.getLatestAudit(allAudits)

    // take latest audit and get the baseDate for a reference point. Then iterate over months and check to see if an audit exists for that basedate

    let latestBase = latestAudit ? latestAudit.baseDate || moment.utc(latestAudit.createdAt).subtract(1, "day").format() : null
    let currentMoment = latestBase ? moment.utc(latestBase).subtract(1, "month") : moment().subtract(1, "month")
    let count = 0

    while (count < 36) {
      if (!allBaseDates.some((baseDate) => currentMoment.isSame(baseDate, "day")) && currentMoment.isAfter(2004, "year")) {
        options.push({
          label: currentMoment.format("YYYY-MM-DD"),
          value: {
            startDate: currentMoment.clone().subtract(1, "month").format("YYYY-MM-DD"),
            endDate: currentMoment.format("YYYY-MM-DD"),
          },
        })
      }

      currentMoment = currentMoment.clone().subtract(1, "month")
      count ++
    }

    return options
  }


  selectFilterOption (option) {
    this.setState(option.value)
  }

  handleCalendarClick (param, dateTime) {
    this.setState({[param]: dateTime.format("YYYY-MM-DD")})
  }

  audit (e) {
    // start date will be calculated based on the baseDate.
    const cb = () => {
      this.setState({startDate: "", endDate: ""})
    }

    this.props.auditSite(e, {cb, extraParams: {baseDate: this.state.endDate}})
  }

  render () {
    const {endDate, startDate} = this.state
    const {pending, dirty, currentWebsite, audits} = this.props

    if (!currentWebsite || !audits) {
      return null
    }

    //set by function so date will refresh, in case goes past midnight and they didn't refresh browser or something
    const timeRangeOptions = this.timeRangeOptions()
    const currentTimeRangeOption = timeRangeOptions.find((option) => option.value.startDate === startDate)
console.log(startDate, endDate);

    return (
      <Form className={classes.filtersForm} onSubmit={this.audit}>
          <div className={classes.datetimeFilters}>
            <Flexbox justify="space-around">
              <div>
                <h3>Start Date</h3>
                <div>
                  {startDate || "(Pick an end date to set)"}
                </div>
              </div>

              {false &&
              <div className={classes.paramsValue}>
                <h3>End Date</h3>
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
              }

              <div className={classes.timeRangeSelect}>
                <h3>End Date</h3>
                <Select
                  options={timeRangeOptions}
                  onChange={this.selectFilterOption}
                  currentOption={currentTimeRangeOption}
                  name="timerange"
                />
              </div>

            </Flexbox>
              <Button
                className={classes.twoColumns}
                type="submit"
                pending={pending}
                disabled={!endDate}
              >
                Audit site
              </Button>
          </div>
      </Form>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setAuditFilter: (payload) => dispatch({type: "", payload}),

  }
}

const mapStateToProps = state => {
  return {
    currentWebsite: state.currentWebsite,
    availableWebsites: state.availableWebsites,
    audits: state.audits || {},
    dirty: Helpers.safeDataPath(state, "forms.Analytics.filters.dirty"),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuditCreator))

