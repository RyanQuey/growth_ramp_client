import { Component } from 'react';
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import {
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
  REACTIVATE_OR_CREATE_WEBSITE_REQUEST,
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
import analyticsHelpers from 'helpers/analyticsHelpers'

class AuditSiteSetup extends Component {
  constructor() {
    super()
    this.state = {
      pending: true,
      websiteId: false,
      profileId: false,
    }

    this.refreshGAAccounts = this.refreshGAAccounts.bind(this)
    this.setAnalyticsProfileFilter = this.setAnalyticsProfileFilter.bind(this)
    this.selectFilterOption = this.selectFilterOption.bind(this)
    this.websiteOptions = this.websiteOptions.bind(this)
    this.profileOptions = this.profileOptions.bind(this)
    this.setWebsiteFilter = this.setWebsiteFilter.bind(this)
    this.setSite = this.setSite.bind(this)
  }

  componentDidMount() {
    // TODO on mount check if website has the webpage we're looking for, rather than just clearing
    this.props.history.push(this.props.location.pathname)
    this.refreshGAAccounts()
  }

  websiteOptions () {
    const {googleAccounts, availableWebsites, dirty} = this.props
    const {gaSites = {}} = availableWebsites

    return Object.keys(gaSites).map((id) => {
      let website = gaSites[id]

      return {
        label: website.name || website.websiteUrl,
        value: {website},
        website,
      }
    })
  }

  profileOptions () {
    const {googleAccounts, websites, availableWebsites, dirty} = this.props
    const {gaSites = {}} = availableWebsites
    const currentWebsite = gaSites[this.state.websiteId]

    return currentWebsite && currentWebsite.profiles.map((profile) => ({
      value: {profile},
      label: profile.name,
      profile,
    }))
  }

  //gets the accounts and all the availableWebsites we could filter/show
  refreshGAAccounts(cbcb) {
    const cb = ({gaAccounts, gscAccounts}) => {
      this.setState({pending: false})
      const {websiteId, profileId} = this.state

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
        let defaultProfileId

        if (defaultSite && defaultSite.profiles && defaultSite.profiles.length) {
          defaultProfileId = defaultSite.profiles[0].id
        }
console.log(defaultSite);
        this.setState({
          websiteId: defaultSite.id,
          profileId: defaultProfileId,
        })
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
console.log(option);
  }

  //for filtering which availableWebsites to show analytics for
  setWebsiteFilter (websiteOption) {
    const {website} = websiteOption

    console.log("website", website)
    // clear query string since new website wouldn't have the same webpages
    this.props.history.push(this.props.location.pathname)


    //default to first profile
    let defaultProfileId = ""
    if (website.profiles && website.profiles.length) {
      defaultProfileId = website.profiles[0].id
    }
    this.setState({
      websiteId: website.id,
      profileId: defaultProfileId,
    })
  }

  // called "view" or "profile" by GA
  setAnalyticsProfileFilter({profile}) {
    this.setState({
      profileId: profile.id,
    })

  }

  setSite (e) {
    e && e.preventDefault()
    // find or create a website record with this exact combination
    // set as active. Should be the only active website

    const {googleAccounts, availableWebsites, dirty} = this.props
    const {websiteId, profileId} = this.state

    const {gaSites, gscSites} = availableWebsites
    const currentGoogleAccount = googleAccounts && googleAccounts[0]
    const currentWebsite = gaSites && gaSites[websiteId]

    const gaSiteUrl = currentWebsite.websiteUrl
    const gscSiteUrl = analyticsHelpers.getGSCUrlFromGAUrl(gaSiteUrl, gscSites) || ""
    const gscData = gscSiteUrl && gscSites[gscSiteUrl]

    const params = {
      gaWebPropertyId: websiteId,
      gaProfileId: profileId,
      name: currentWebsite.name,
      gscSiteUrl,
      gscPermissionLevel: gscData ? gscData.permissionLevel : "",
      gaSiteUrl,
      googleAccountId: currentGoogleAccount.id,
      externalGaAccountId: currentWebsite.externalGaAccountId,
    }

    const cb = (result) => {
      console.log("finished in callback");
      this.setState({pending: false})
    }

    const onFailure = (err) => {
      console.log("finished in failure");
      this.setState({pending: false})
    }

    this.setState({pending: true})
    this.props.reactivateOrCreateWebsite(params, cb, onFailure)
  }


  render () {
    const {pending} = this.state
    const {googleAccounts, availableWebsites, dirty} = this.props
    const {gaSites = {}} = availableWebsites

    const {websiteId, profileId} = this.state

    const currentWebsite = gaSites && gaSites[websiteId]
    //TODO have a dropdown
    const currentGoogleAccount = googleAccounts && googleAccounts[0]

    //set by function so date will refresh, in case goes past midnight and they didn't refresh browser or something

    const websiteOptions = this.websiteOptions() || []
    const currentWebsiteOption = websiteOptions.find((option) => option.website.id === websiteId)

    const profileOptions = this.profileOptions() || []
    const currentProfileOption = profileOptions.find((option) => option.profile.id === profileId)


    // curently only can do one site. So saving will just overwrite the one website record they have. If they have a website set, will just skip this step
    // In the future though, users can create several website records if their subscription allows for it
    return (
      <Form className={classes.filtersForm} onSubmit={this.setSite}>
        <Flexbox className={classes.websiteFilters}>
          <div className={classes.googleBtn}>
            <SocialLogin
              pending={pending}
              togglePending={this.props.togglePending}
              providers={_.pick(PROVIDERS, "GOOGLE")}
            />
            <div>Google Account: {currentGoogleAccount ? currentGoogleAccount.userName : "None available"}</div>
          </div>

          {Object.keys(gaSites).length && (
            <div className={classes.websiteSelect}>
              <div>Website: </div>
              <Select
                options={websiteOptions}
                currentOption={currentWebsiteOption || websiteOptions[0]}
                name="website"
                onChange={this.setWebsiteFilter}
              />
            </div>
          )}

          {currentWebsite &&
            <div className={classes.websiteSelect}>
              <div>Analytics Profile: </div>
              <Select
                options={profileOptions}
                currentOption={currentProfileOption || profileOptions[0]}
                name="profileId"
                onChange={this.setAnalyticsProfileFilter}
              />
            </div>
          }
        </Flexbox>

        {currentProfileOption || profileOptions[0] ? (
          <div className={classes.datetimeFilters}>
            <Flexbox>
            </Flexbox>

            {<Button type="submit" pending={pending} disabled={!profileId}>Choose Site to Audit</Button>}
          </div>
        ) : (
          <div>No analytics profiles connected to your google account. </div>
        )}
      </Form>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllGAAccounts: (payload, cb, onFailure) => dispatch({type: FETCH_ALL_GA_ACCOUNTS_REQUEST, payload, cb, onFailure}),
    reactivateOrCreateWebsite:  (payload, cb, onFailure) => dispatch({type: REACTIVATE_OR_CREATE_WEBSITE_REQUEST, payload, cb, onFailure}),
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    campaigns: state.campaigns,
    googleAccounts: Helpers.safeDataPath(state, "providerAccounts.GOOGLE", []).filter((account) => !account.unsupportedProvider),
    availableWebsites: state.availableWebsites,
    dirty: Helpers.safeDataPath(state, "forms.Analytics.filters.dirty"),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuditSiteSetup))
