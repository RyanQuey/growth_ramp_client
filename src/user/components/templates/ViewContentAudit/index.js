import { Component } from 'react';
import { connect } from 'react-redux'
import {
  AUDIT_CONTENT_REQUEST,
  GET_GA_GOALS_REQUEST,
  FETCH_AUDIT_REQUEST,
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
  SET_CURRENT_AUDIT_SECTION,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form, Navbar } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import {
} from 'user/components/partials'
import { SocialLogin } from 'shared/components/partials'
import {  } from 'user/components/groups'
import { AuditMetadata, AuditSiteSelector, MaybeFixedIssues, FixedIssues, CurrentIssues, AuditCreator } from 'user/components/partials'
import { AUDIT_RESULTS_SECTIONS, } from 'constants/auditTests'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
import {formActions, alertActions} from 'shared/actions'
import {
  withRouter,
} from 'react-router-dom'
import analyticsHelpers from 'helpers/analyticsHelpers'
import theme from 'theme'
import classes from './style.scss'

class ViewContentAudit extends Component {
  constructor() {
    super()
    this.state = {
      pending: false,
      settingsOpen: false,
    }

    this.togglePending = this.togglePending.bind(this)
    this.setFilters = this.setFilters.bind(this)
    this.auditSite = this.auditSite.bind(this)
    this.refreshWebsiteAudits = this.refreshWebsiteAudits.bind(this)
    this.fetchAudits = this.fetchAudits.bind(this)
    this.setCurrentAuditSection = this.setCurrentAuditSection.bind(this)
    this.refreshGAAccounts = this.refreshGAAccounts.bind(this)
    this.toggleSettings = this.toggleSettings.bind(this)
    this.configureWebsites = this.configureWebsites.bind(this)
  }

  componentWillMount() {
    const {filters, goals, availableWebsites} = this.props

    const currentWebsite = Helpers.safeDataPath(this.props, "currentWebsite")
    if (currentWebsite) {
      this.fetchAudits(currentWebsite.id)
      if (!this.props.goals[currentWebsite.id]) {
        const {gaWebPropertyId, googleAccountId, externalGaAccountId} = currentWebsite
        this.props.getGoals({gaWebPropertyId, googleAccountId, externalGaAccountId, websiteId: currentWebsite.id}) //only be filtering by websiteId for now. can manually sort by profile or webproperty in frontend later too
      }
    }
    this.setCurrentAuditSection(Object.keys(AUDIT_RESULTS_SECTIONS)[0])

    if (!Object.keys(availableWebsites).length ) {
      this.refreshGAAccounts()
    }
  }

  componentWillReceiveProps(props) {
    const currentWebsite = Helpers.safeDataPath(props, "currentWebsite")
    if (
      currentWebsite &&
      Helpers.safeDataPath(this.props, "currentWebsite.id") !== currentWebsite.id
    ) {
      this.fetchAudits(currentWebsite.id)
      if (!this.props.goals[currentWebsite.id]) {
        const {gaWebPropertyId, googleAccountId, externalGaAccountId} = currentWebsite
        this.props.getGoals({gaWebPropertyId, googleAccountId, externalGaAccountId, websiteId: currentWebsite.id}) //only filtering by websiteId for now. can manually sort by profile or webproperty in frontend later too
      }
    }
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value}) //only for social login so far
  }

  toggleSettings (value = !this.state.settingsOpen, e) {
    this.setState({settingsOpen: value})
  }

  configureWebsites (e) {
    e && e.preventDefault()

    this.props.history.push("/settings/websites")
  }


  // filter should be object, keys being params that will be overwritten for the analytics filters
  // TODO get rid of; no longer using
  setFilters(filtersToMerge, options = {}) {
    formActions.setParams("AuditContent", "filters", filtersToMerge)
  }

  fetchAudits (websiteId) {
    const cb = () => {
      this.setState({pending: false})
    }
    const onFailure = (err) => {
      this.setState({pending: false})
      alertActions.newAlert({
        title: "Failure to retrieve audits: ",
        level: "DANGER",
        message: err.message || "Unknown error",
        options: {timer: false},
      })
    }

    this.setState({pending: true})

    this.props.fetchAudits({websiteId}, cb, onFailure)
  }

  //gets the accounts and all the availableWebsites we could filter/show
  refreshGAAccounts(cbcb) {
    const cb = ({gaAccounts, gscAccounts}) => {
      this.setState({pending: false})
    }
    const onFailure = (err) => {
      this.setState({pending: false})
    }

    this.setState({pending: true})
    this.props.fetchAllGAAccounts({}, cb, onFailure)
  }

  auditSite (e, options = {}) {
    e && e.preventDefault()
    //TODO set filters to store, and then use in saga
    formActions.formPersisted("AuditContent", "filters")
    const cb = () => {
      alertActions.newAlert({
        title: "Successfully audited site!",
        level: "SUCCESS",
        options: {}
      })

      this.setState({pending: false})

      options.cb && options.cb()
    }
    const onFailure = (err) => {
      this.setState({pending: false})
    }

    this.setState({pending: true})

    // be careful using props, since could be out of date (if just changed filters before props could get propogated)
    const {audits, filters, analytics, currentWebsite, user} = this.props
    const dataset = analyticsHelpers.getDataset("contentAudit", filters, null, {testGroup: "nonGoals"})

    let paramsToMerge = analyticsHelpers.getDatasetDefaultFilters(dataset)
    if (options.extraParams) {
      Object.assign(paramsToMerge, options.extraParams)
    }

    const params = Object.assign({}, filters, paramsToMerge,
      {
        testGroup: "nonGoals",
        dateLength: "month",
        userId: user.id,
        websiteId: currentWebsite.id
      },
      _.pick(currentWebsite, ["gscSiteUrl", "gaProfileId", "gaSiteUrl", "gaWebPropertyId", "googleAccountId"]),
    )


    //don't need last used anymore
    //formActions.setParams("AuditContent", "dataset", {lastUsedDataset: dataset})

    this.props.auditSite(params, cb, onFailure)
  }

  // NOTE we also have a func to update just one audit if we want to do that, but not sure of many use cases yet, besides testing
  refreshWebsiteAudits () {
    const {currentWebsite, user} = this.props
    const cb = () => {
      alertActions.newAlert({
        title: "Successfully refreshed audits for site!",
        level: "SUCCESS",
        options: {}
      })

      this.setState({pending: false})

      options.cb && options.cb()
    }
    const onFailure = (err) => {
      this.setState({pending: false})
    }

    const params = {
      userId: user.id,
      websiteId: currentWebsite.id
    }

    this.setState({pending: true})
    this.props.refreshWebsiteAudits(params, cb, onFailure)

  }

  setCurrentAuditSection (auditSection) {
    this.props.setCurrentAuditSection(auditSection)
  }

  render () {
    const {pending, settingsOpen} = this.state
    const {audits, analytics, websites, currentAudit, previousAudit, currentAuditSection, currentWebsite, user} = this.props
    //wait to finish initializing store at least
    if (false) {
      return <Icon name="spinner"/>
    }

    const query = new URLSearchParams(document.location.search)
    const webpageQueryValue = query.get("webpage")

    let TabContent
    if (currentAuditSection === "currentIssues") {
      TabContent = CurrentIssues
    } else if (currentAuditSection === "fixed") {
      TabContent = FixedIssues
    } else if (currentAuditSection === "maybeFixed") {
      TabContent = MaybeFixedIssues
    }
//TODO add goal selector here

    return (
      <div className={classes.viewAnalytics}>
        <h1>Content Audit</h1>
        <div>
          {currentWebsite ? currentWebsite.name : "No websites yet; configure websites by clicking below to get started"}
        </div>

        <h2>Settings</h2>
        {Object.keys(websites).length > 0 ? (
          <div>
            <a className={classes.toggleSettingsBtn} onClick={this.toggleSettings.bind(this, !settingsOpen)}>{settingsOpen ? "Hide Settings" : "Show Settings"}</a>
            <div className={`${classes.settings} ${settingsOpen ? classes.open : classes.closed}`}>
              <AuditSiteSelector
                togglePending={this.togglePending}
              />

              <a onClick={this.configureWebsites}>Configure Websites</a>
              {Object.keys(audits).length > 0 && (
                <AuditMetadata />
              )}
            </div>
          </div>
        ) : (
          <a onClick={this.configureWebsites}>Add a Website</a>
        )}

        {Object.keys(audits).length > 0 ? (
            <div>
              {currentAudit &&
                <div>
                  <h2>Audit Results</h2>
                  <Navbar className="" justifyTabs="flex-start" background={theme.color.moduleGrayOne} color={theme.color.text} tabs={true}>
                    <ul>
                      {Object.keys(AUDIT_RESULTS_SECTIONS).map((section) => {
                        const sectionData = AUDIT_RESULTS_SECTIONS[section]
                        const title = sectionData.title

                        return <li
                          key={title}
                          ref={title}
                          className={`${classes.tab} ${currentAuditSection === section ? classes.selected : ""}`}
                          onClick={this.setCurrentAuditSection.bind(this, section)}
                        >
                          <span>{title}</span>
                        </li>
                      })}
                    </ul>
                  </Navbar>

                  <div className={classes.tabContent}>
                    <TabContent />
                  </div>
                </div>
              }
            </div>
          ) : (
            currentWebsite && <div>
              No audits yet. Click below to get started!
              <Button
                onClick={this.auditSite}
                className={classes.twoColumns}
              >
                Audit site
              </Button>
            </div>
          )
        }
        {Helpers.isSuper(user) &&
          <div>
            <h2>Super Admin Bonuses</h2>
            <h3>Run Custom Audits</h3>
            <AuditCreator
              auditSite={this.auditSite}
              pending={pending}
            />
            <h3>Refresh Custom Audits</h3>
            <div>WARNING: Does not refresh the current audit you are looking at; to refresh those audit lists and their items, switch to a different audit then switch back</div>
            <Button
              onClick={this.refreshWebsiteAudits}
              className={classes.twoColumns}
            >
              Refresh Audits for Site
            </Button>
          </div>
        }
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentAuditSection: (audit) => dispatch({type: SET_CURRENT_AUDIT_SECTION, payload: audit}),
    fetchAllGAAccounts: (payload, cb, onFailure) => dispatch({type: FETCH_ALL_GA_ACCOUNTS_REQUEST, payload, cb, onFailure}),
    getGoals: (payload, cb, onFailure) => dispatch({
      type: GET_GA_GOALS_REQUEST,
      payload,
      cb,
      onFailure,
    }),
    fetchAudits: (payload, cb, onFailure) => dispatch({
      type: FETCH_AUDIT_REQUEST,
      payload,
      cb,
      onFailure,
    }),
    auditSite: (payload, cb, onFailure) => dispatch({
      type: AUDIT_CONTENT_REQUEST,
      payload,
      cb,
      onFailure,
    }),
    //TODO setup proper actions etc when we know we want to do it this way
    refreshWebsiteAudits: (payload, cb, onFailure) => {
      axios.post("/api/audits/refreshWebsiteAudits", payload)
      .then((result) => {
        cb(result)
      })
      .catch((err) => {
        console.error(err);
        onFailure(err)
      })
    }
  }
}

const mapStateToProps = state => {
  return {
    analytics: state.analytics,
    // only want audits for current website
    audits: _.pickBy(state.audits, (value, key) => state.currentWebsite && value.websiteId === state.currentWebsite.id),
    availableWebsites: state.availableWebsites,
    currentAudit: state.currentAudit,
    previousAudit: state.previousAudit,
    currentAuditSection: state.currentAuditSection,
    user: state.user,
    goals: state.goals,
    websites: state.websites,
    currentWebsite: state.currentWebsite,
    filters: Helpers.safeDataPath(state, "forms.AuditContent.filters.params", {}),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewContentAudit))
