import { Component } from 'react';
import { connect } from 'react-redux'
import {
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
  GET_ANALYTICS_REQUEST,
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
    this.getAnalytics = this.getAnalytics.bind(this)
    this.setAnalyticsFilter = this.setAnalyticsFilter.bind(this)
    this.setAnalyticsProfileFilter = this.setAnalyticsProfileFilter.bind(this)
    this.setDateFilter = this.setDateFilter.bind(this)
  }

  componentWillMount() {
    this.refreshGAAccounts()
  }

  timeRangeOptions () {
    //default is first option, one week, which is what GA defaults to
    return [
      {
        label: "Past 7 Days",
        value: {
          startDate: moment().subtract(7, "days").format("YYYY-MM-DD"),
          endDate: moment().format("YYYY-MM-DD"),
        },
      },
      {
        label: "Past 30 Days",
        value: {
          startDate: moment().subtract(30, "days").format("YYYY-MM-DD"),
          endDate: moment().format("YYYY-MM-DD"),
        },
      },
      {
        label: "Total",
        value: {
          startDate: "2005-01-01", //GA started, so can't go before this
          endDate: moment().format("YYYY-MM-DD"),
        }
      },
    ]
  }

  //gets the accounts and all the websites we could filter/show
  refreshGAAccounts(cbcb) {
    const cb = (googleAccts) => {
      this.setState({pending: false})
      const {websiteId, profileId} = this.props

      if (!websiteId) {
        //is initializing table for first time; default to first site and first profile of that site (often will be the only profile...total)
        let matchingIndex
        const gAccountWithSite = googleAccts && googleAccts.find((acct) => {
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
          this.setAnalyticsFilter({
            websiteId: defaultSite.id,
            providerAccountId: defaultSite.providerAccountId,
            profileId: Helpers.safeDataPath(defaultSite, `profiles.0.id`, ""),
          })

          this.getAnalytics()
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

  // filter should be object, keys being params that will be overwritten for the analytics filters
  setAnalyticsFilter(filter) {
    formActions.setParams("Analytics", "filters", filter)
  }

  setDateFilter(selectedOption) {
    const {startDate, endDate} = selectedOption.value

    this.setAnalyticsFilter({startDate, endDate})
  }

  //for filtering which websites to show analytics for
  setWebsiteFilter(website) {
    //default to first profile
    let defaultProfileId = ""
    if (website.profiles && website.profiles.length) {
      defaultProfileId = website.profiles[0].id
    }

    this.setAnalyticsFilter({
      websiteId: website.id,
      providerAccountId: website.providerAccountId,
      profileId: defaultProfileId,
    })
  }

  // called "view" or "profile" by GA
  setAnalyticsProfileFilter(profile) {
    this.setAnalyticsFilter({
      profileId: profile.id
    })
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
    this.props.getAnalytics({}, cb, onFailure)
  }

  render () {
    const {pending} = this.state
    const {googleAccounts, websites, dirty, filters} = this.props

    if (!filters || !websites) {
      return <Icon name="spinner"/>
    }
    const {websiteId, profileId, startDate, endDate} = filters

    const currentWebsite = websites[websiteId]
    const currentGoogleAccount = googleAccounts && googleAccounts[0]


    //set by function so date will refresh, in case goes past midnight and they didn't refresh browser or something
    const timeRangeOptions = this.timeRangeOptions()
console.log(startDate);
    const currentTimeRangeOption = timeRangeOptions.find((option) => option.value.startDate === startDate)

    return (
      <Form onSubmit={this.getAnalytics}>
        <div>Google Account: {currentGoogleAccount.userName}</div>

        {Object.keys(websites).length ? (
          <div>
            <h4>Choose Analytics Set</h4>

            {Object.keys(websites).map((id) => {
              let website = websites[id]

              return <Button
                key={id}
                onClick={this.setWebsiteFilter.bind(this, website)}
                selected={id === websiteId}
              >
                {website.name || website.websiteUrl}
              </Button>
            })}

            {currentWebsite &&
              <div>
                {currentWebsite.profiles.map((profile) =>
                  <Button
                    key={profile.id}
                    onClick={this.setAnalyticsProfileFilter.bind(this, profile)}
                    selected={profile.id === profileId}
                  >
                    {profile.name}
                  </Button>
                )}
              </div>
            }

            <Select
              label="Time Range"
              className={classes.select}
              options={timeRangeOptions}
              onChange={this.setDateFilter}
              currentOption={currentTimeRangeOption || timeRangeOptions[0]}
              name="timerange"
            />

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
    getAnalytics: (payload, cb, onFailure) => dispatch({
      type: GET_ANALYTICS_REQUEST,
      payload,
      cb,
      dataset: "websiteSummary",
      onFailure
    }),
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
