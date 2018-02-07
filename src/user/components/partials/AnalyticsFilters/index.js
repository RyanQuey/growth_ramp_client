import { Component } from 'react';
import { connect } from 'react-redux'
import {
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
  GET_ANALYTICS_REQUEST,
  SET_ANALYTICS_FILTER,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import {
} from 'user/components/partials'
import { SocialLogin } from 'shared/components/partials'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
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
      analyticsPending: false,
    }

    this.refreshGAAccounts = this.refreshGAAccounts.bind(this)
    this.getAnalytics = this.getAnalytics.bind(this)
    this.setAnalyticsFilter = this.setAnalyticsFilter.bind(this)
    this.setAnalyticsProfileFilter = this.setAnalyticsProfileFilter.bind(this)
  }

  componentWillMount() {
    this.refreshGAAccounts()
  }

  //gets the accounts and all the websites we could filter/show
  refreshGAAccounts(cbcb) {
    const cb = (analyticsAccts) => {
      this.setState({pending: false})
      const {currentWebsiteId, currentAnalyticsProfileId} = this.props

      if (!currentWebsiteId) {
        //is initializing table for first time; default to first site and first profile of that site (often will be the only profile...total)
        const defaultSite = Helpers.safeDataPath(analyticsAccts, `0.items.0.webProperties.0`, {})
        this.setAnalyticsFilter({
          websiteId: defaultSite.id,
          providerAccountId: defaultSite.providerAccountId,
          profileId: Helpers.safeDataPath(defaultSite, `profiles.0.id`, ""),
        })

        this.getAnalytics()
      }
    }

    this.setState({pending: true})
    this.props.fetchAllGAAccounts({}, cb)
  }

  // filter should be object, keys being params that will be overwritten for the analytics filters
  setAnalyticsFilter(filter) {
    formActions.setParams("Analytics", "filters", filter)
  }

  //for filtering which websites to show analytics for
  setWebsiteFilter(website) {
    this.setAnalyticsFilter({
      websiteId: website.id,
      providerAccountId: website.providerAccountId,
      profileId: "",
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
    const cb = () => {
      this.setState({analyticsPending: false})
      formActions.formPersisted("Analytics", "filters")
    }

    this.setState({analyticsPending: true})
    this.props.getAnalytics({}, cb)
  }

  render () {
    const {googleAccounts, websites, currentWebsiteId, currentAnalyticsProfileId, dirty} = this.props
    const {pending} = this.state
    const currentWebsite = websites[currentWebsiteId]
console.log(currentWebsite && currentWebsite.profiles);
    const currentGoogleAccount = googleAccounts && googleAccounts[0]

    if (pending) {
      return <Icon name="spinner"/>
    }

    return (
      <div>
          <Form onSubmit={this.getAnalytics}>
            {currentGoogleAccount.userName}
            {Object.keys(websites).length ? (
              <div>
                <h4>Choose Analytics Set</h4>

                {Object.keys(websites).map((id) => {
                  let website = websites[id]

                  return <Button
                    key={id}
                    onClick={this.setWebsiteFilter.bind(this, website)}
                    selected={id === currentWebsiteId}
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
                        selected={profile.id === currentAnalyticsProfileId}
                      >
                        {profile.name}
                      </Button>
                    )}
                  </div>
                }

                <Button type="submit" disabled={!currentAnalyticsProfileId || !dirty}>Submit</Button>
              </div>
            ) : (
              <div>No websites connected to your google account. </div>
            )}
          </Form>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllGAAccounts: (payload, cb) => dispatch({type: FETCH_ALL_GA_ACCOUNTS_REQUEST, payload, cb}),
    getAnalytics: (payload, cb) => dispatch({type: GET_ANALYTICS_REQUEST, payload, cb, dataset: "websiteSummary"}),
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    campaigns: state.campaigns,
    googleAccounts: Helpers.safeDataPath(state, "providerAccounts.GOOGLE", []).filter((account) => !account.unsupportedProvider),
    websites: state.websites,
    currentWebsiteId: Helpers.safeDataPath(state, "forms.Analytics.filters.params.websiteId"),
    currentAnalyticsProfileId: Helpers.safeDataPath(state, "forms.Analytics.filters.params.profileId"),
    dirty: Helpers.safeDataPath(state, "forms.Analytics.filters.dirty"),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AnalyticsFilters))
