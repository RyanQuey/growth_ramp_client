import { Component } from 'react';
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import {
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
      pending: false,
      websiteId: false,
      profileId: false,
    }

    this.setAnalyticsProfileFilter = this.setAnalyticsProfileFilter.bind(this)
    this.websiteOptions = this.websiteOptions.bind(this)
    this.profileOptions = this.profileOptions.bind(this)
    this.setWebsiteFilter = this.setWebsiteFilter.bind(this)
    this.setSite = this.setSite.bind(this)
    this.viewAudits = this.viewAudits.bind(this)
    this.goToPaymentDetails = this.goToPaymentDetails.bind(this)
  }

  componentDidMount() {
  }

  componentWillReceiveProps(props) {
    // when async call to get all ga sites comes in
    const gaSites = props.availableWebsites.gaSites
    const {websiteId, profileId} = this.state
    if (!websiteId && gaSites) {
      //is initializing table for first time; default to first site and first profile of that site (often will be the only profile...total)
      let matchingIndex
      const defaultSite = gaSites[Object.keys(gaSites)[0]]
      let defaultProfileId
      if (defaultSite && defaultSite.profiles && defaultSite.profiles.length) {
        defaultProfileId = defaultSite.profiles[0].id
      }
      this.setState({
        websiteId: defaultSite.id,
        profileId: defaultProfileId,
      })
    }
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
    const chosenWebsite = gaSites[this.state.websiteId]

    const currentWebsitesArr = Object.keys(websites).map((siteId) => websites[siteId])

    return chosenWebsite && chosenWebsite.profiles
    .filter((profile) => {
      //filter out profiles that are already active
      return !currentWebsitesArr.some((site) => site.gaProfileId === profile.id)
    })
    .map((profile) => ({
      value: {profile},
      label: profile.name,
      profile,
    }))
  }


  //for filtering which availableWebsites to show analytics for
  setWebsiteFilter (websiteOption) {
    const {website} = websiteOption

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

  goToPaymentDetails(e) {
    e && e.preventDefault()

    this.props.history.push("/settings/paymentDetails")
  }

  viewAudits (e) {
    e && e.preventDefault()
    alertActions.closeAlerts()
    this.props.history.push("/analytics/content-audit")
  }

  // when they pick the website for good
  setSite (e) {
    e && e.preventDefault()
    // find or create a website record with this exact combination
    // set as active. Should be the only active website

    const {googleAccounts, availableWebsites, dirty} = this.props
    const {websiteId, profileId} = this.state

    const {gaSites, gscSites} = availableWebsites
    const currentGoogleAccount = googleAccounts && googleAccounts[0]
    const chosenWebsite = gaSites && gaSites[websiteId]

    const gaSiteUrl = chosenWebsite.websiteUrl
    const gscSiteUrl = analyticsHelpers.getGSCUrlFromGAUrl(gaSiteUrl, gscSites) || ""
    const gscData = gscSiteUrl && gscSites[gscSiteUrl]

    const params = {
      gaWebPropertyId: websiteId,
      gaProfileId: profileId,
      name: chosenWebsite.name,
      gscSiteUrl,
      gscPermissionLevel: gscData ? gscData.permissionLevel : "",
      gaSiteUrl,
      googleAccountId: currentGoogleAccount.id,
      externalGaAccountId: chosenWebsite.externalGaAccountId,
    }

    const cb = (result) => {
      this.props.toggleAddingSite(false)
      this.setState({pending: false})
      alertActions.newAlert({
        title: "Successfully Chose Website!",
        message: <Button onClick={this.viewAudits}>Get Started</Button>,
        level: "SUCCESS",
        options: {timer: false}
      })

    }

    const onFailure = (err) => {
      this.setState({pending: false})
    }

    this.setState({pending: true})
    this.props.reactivateOrCreateWebsite(params, cb, onFailure)
  }


  render () {
    const {pending, websiteId, profileId} = this.state
    const {googleAccounts, availableWebsites, dirty, websites, accountSubscription} = this.props
    const {gaSites = {}} = availableWebsites


    const chosenWebsite = gaSites && gaSites[websiteId]
    //TODO have a dropdown, when supporting multiple sites
    const currentGoogleAccount = googleAccounts && googleAccounts[0]

    //set by function so date will refresh, in case goes past midnight and they didn't refresh browser or something

    const websiteOptions = this.websiteOptions() || []
    const chosenWebsiteOption = websiteOptions.find((option) => option.website.id === websiteId)

    const profileOptions = this.profileOptions() || []
    const currentProfileOption = profileOptions.find((option) => option.profile.id === profileId)

    const websitesAllowed = accountSubscription.websiteQuantity || 1
    if (Object.keys(websites).length > websitesAllowed ) {
      return <div>
        <div>
          You have only paid for {websitesAllowed} website{websitesAllowed > 1 ? "s" : ""} at a time.
        </div>
        <div>
          <a className={classes.increaseLimit} onClick={this.goToPaymentDetails}>Click here to increase your limit</a>
        </div>
      </div>
    }

    // curently only can do one site. So saving will just overwrite the one website record they have. If they have a website set, will just skip this step
    // In the future though, users can create several website records if their subscription allows for it
    return (
      <Form className={classes.siteForm} onSubmit={this.setSite}>
        <Flexbox className={classes.websiteFilters} direction="column">
          <div className={classes.googleBtn}>
            <div>Google Account: {currentGoogleAccount ? currentGoogleAccount.userName : "None available"}</div>
            <SocialLogin
              pending={pending}
              togglePending={this.props.togglePending}
              providers={_.pick(PROVIDERS, "GOOGLE")}
            />
          </div>

          <Flexbox justify="space-between">
            {Object.keys(gaSites).length > 0 && (
              <div className={classes.websiteSelect}>
                <div>Website: </div>
                <Select
                  options={websiteOptions}
                  currentOption={chosenWebsiteOption}
                  name="website"
                  onChange={this.setWebsiteFilter}
                />
              </div>
            )}

            {chosenWebsite &&
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
        </Flexbox>

        {(currentProfileOption || profileOptions[0]) ? (
          <div className={classes.datetimeFilters}>
            <Flexbox>
            </Flexbox>

            <Button type="submit" pending={pending} disabled={!profileId}>Choose Site to Audit</Button>
          </div>
        ) : (
          chosenWebsite && <div>No analytics profiles connected to this google account.</div>
        )}
      </Form>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reactivateOrCreateWebsite:  (payload, cb, onFailure) => dispatch({type: REACTIVATE_OR_CREATE_WEBSITE_REQUEST, payload, cb, onFailure}),
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    accountSubscription: state.accountSubscription,
    googleAccounts: Helpers.safeDataPath(state, "providerAccounts.GOOGLE", []).filter((account) => !account.unsupportedProvider),
    availableWebsites: state.availableWebsites,
    currentWebsite: state.currentWebsite,
    websites: state.websites,
    dirty: Helpers.safeDataPath(state, "forms.Analytics.filters.dirty"),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuditSiteSetup))
