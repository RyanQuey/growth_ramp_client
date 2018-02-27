import { Component } from 'react';
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import {
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
  SET_ANALYTICS_FILTER,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { SocialLogin } from 'shared/components/partials'
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

    this.refreshGAAccounts = this.refreshGAAccounts.bind(this)
    this.setAnalyticsProfileFilter = this.setAnalyticsProfileFilter.bind(this)
    this.selectFilterOption = this.selectFilterOption.bind(this)
    this.handleCalendarClick = this.handleCalendarClick.bind(this)

  }

  componentDidMount() {
    this.refreshGAAccounts()
  }

  componentWillReceiveProps (props) {
    if (
      /*!_.isEqual(
        _.pick(props.filters, ["startDate", "endDate", "defaultChannelGrouping", "websiteId"]),
        _.pick(this.props.filters, ["startDate", "endDate", "defaultChannelGrouping", "websiteId"])
      ) ||*/
      props.baseOrganization !== this.props.baseOrganization
    ) {
      // clear the extras
      formActions.clearParams("Analytics", "tableDataset")
      this.props.getAnalytics()
    }
  }

  timeRangeOptions () {
    //default is first option, one week, which is what GA defaults to
    const yesterday = moment().subtract(1, "day")
    return [
      {
        label: "Select",
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

  //gets the accounts and all the websites we could filter/show
  refreshGAAccounts(cbcb) {
    const cb = ({gaAccounts, gscAccounts}) => {
      this.setState({pending: false})
      const {websiteId, profileId} = this.props

      if (!websiteId) {
        //is initializing table for first time; default to first site and first profile of that site (often will be the only profile...total)
        let matchingIndex
        const gAccountWithSite = gaAccounts && gaAccounts.find((acct) => {
          const analyticsAccounts = acct && acct.items
          //find first analytics account with a website and grab that site
          const hasSite = analyticsAccounts.some((account, index) => {
            matchingIndex = index
            // find first one with at least one web property (aka website) and one profile (aka view)
            return Helpers.safeDataPath(account, `webProperties.0.profiles.0`, false)
          })

          return hasSite
        })
        const defaultSite = gAccountWithSite && gAccountWithSite.items[matchingIndex].webProperties[0]

        if (defaultSite) {
          this.props.setAnalyticsFilters({
            websiteId: defaultSite.id,
            websiteUrl: defaultSite.websiteUrl,
            providerAccountId: defaultSite.providerAccountId,
            profileId: Helpers.safeDataPath(defaultSite, `profiles.0.id`, ""),
          })

          this.props.getAnalytics()
        } else {
          this.setState({pending: false})
        }
      }
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

  selectFilterOption (option) {
    this.props.setAnalyticsFilters(option.value)
  }

  handleCalendarClick (param, dateTime) {

    this.props.setAnalyticsFilters({[param]: dateTime.format("YYYY-MM-DD")})
  }

  //for filtering which websites to show analytics for
  setWebsiteFilter (website) {
    //default to first profile
    let defaultProfileId = ""
    if (website.profiles && website.profiles.length) {
      defaultProfileId = website.profiles[0].id
    }

    this.props.setAnalyticsFilters({
      websiteId: website.id,
      providerAccountId: website.providerAccountId,
      profileId: defaultProfileId,
    })
  }

  // called "view" or "profile" by GA
  setAnalyticsProfileFilter(profile) {
    this.props.setAnalyticsFilters({
      profileId: profile.id
    })
  }

  render () {
    const {pending} = this.state
    const {googleAccounts, websites, dirty, filters} = this.props
    const {gaSites} = websites

    if (!filters || !gaSites) {
      return <Icon name="spinner"/>
    }
    const {websiteId, profileId, startDate, endDate, dimensionFilterClauses} = filters

    const currentWebsite = gaSites[websiteId]
    const currentGoogleAccount = googleAccounts && googleAccounts[0]


    //set by function so date will refresh, in case goes past midnight and they didn't refresh browser or something
    const timeRangeOptions = this.timeRangeOptions()
    const currentTimeRangeOption = timeRangeOptions.find((option) => option.value.startDate === startDate)

    return (
      <Form className={classes.filtersForm} onSubmit={this.props.getAnalytics}>
        <div>Google Account: {currentGoogleAccount.userName}</div>

        {Object.keys(gaSites).length ? (
          <div>
            <h4>Choose Analytics Set</h4>
            <div>Websites: </div>
            {Object.keys(gaSites).map((id) => {
              let website = gaSites[id]

              return <Button
                key={id}
                onClick={this.setWebsiteFilter.bind(this, website)}
                selected={id === websiteId}
                small={true}
              >
                {website.name || website.websiteUrl}
              </Button>
            })}

            <div>Analytics Profile: </div>
            {currentWebsite &&
              <div>
                {currentWebsite.profiles.map((profile) =>
                  <Button
                    key={profile.id}
                    onClick={this.setAnalyticsProfileFilter.bind(this, profile)}
                    selected={profile.id === profileId}
                    small={true}
                  >
                    {profile.name}
                  </Button>
                )}
              </div>
            }

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

            <Button type="submit" pending={pending} disabled={!profileId || !dirty}>Submit</Button>
          </div>
        ) : (
          <div>No websites connected to your google account. </div>
        )}
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
    user: state.user,
    campaigns: state.campaigns,
    googleAccounts: Helpers.safeDataPath(state, "providerAccounts.GOOGLE", []).filter((account) => !account.unsupportedProvider),
    websites: state.websites,
    filters: Helpers.safeDataPath(state, "forms.Analytics.filters.params"),
    dirty: Helpers.safeDataPath(state, "forms.Analytics.filters.dirty"),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AnalyticsFilters))
