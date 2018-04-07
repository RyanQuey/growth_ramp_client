import { Component } from 'react';
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import {
  SET_CURRENT_WEBSITE,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
import { TIME_RANGE_OPTIONS, } from 'constants/analytics'
import {formActions, alertActions} from 'shared/actions'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'
import analyticsHelpers from 'helpers/analyticsHelpers'

class AuditSiteSelector extends Component {
  constructor() {
    super()
    this.state = {
    }

    this.websiteOptions = this.websiteOptions.bind(this)
    this.setCurrentWebsite = this.setCurrentWebsite.bind(this)
  }

  componentDidMount() {
  }

  componentWillReceiveProps(props) {
    const {currentWebsite, websites} = props

    if (!currentWebsite && Object.keys(websites).length) {
      const defaultSite = websites[Object.keys(websites)[0]]

      this.setCurrentWebsite({website: defaultSite})
    }
  }

  websiteOptions () {
    const {websites, availableWebsites, currentWebsite} = this.props

    return Object.keys(websites).map((id) => {
      let website = websites[id]
      // get profile name, which isn't persisted (TODO not persisted because potentially could change, and we wouldn't know it...though might be better to just poll the GA api and update our record with the name peridically?)
      let availableWebsiteProfiles = Helpers.safeDataPath(availableWebsites, `gaSites.${website.gaWebPropertyId}.profiles`, [])
      let profile = availableWebsiteProfiles.find((profile) => profile.id === website.gaProfileId)

      let profileName = profile && profile.name

      return {
        label: profile ? `${website.name} - ${profileName}` : "",
        value: website.id,
        website,
      }
    })
  }

  //for filtering which websites to show analytics for
  setCurrentWebsite (websiteOption) {
    const {website} = websiteOption

    this.props.setCurrentWebsite(website)
  }

  render () {
    const {websites, dirty, currentWebsite} = this.props
    const {gaSites = {}} = websites

    //set by function so date will refresh, in case goes past midnight and they didn't refresh browser or something

    const websiteOptions = this.websiteOptions()
    const currentWebsiteOption = currentWebsite && websiteOptions.find((option) => option.website.id === currentWebsite.id)

    return (
      <div className={classes.auditSiteSelector}>
        <Flexbox className={classes.websiteFilters} direction="column">
          {Object.keys(websites).length > 0 && (
            <div className={classes.websiteSelect}>
              <h3>Website: </h3>
              <Select
                options={websiteOptions}
                currentOption={currentWebsiteOption || websiteOptions[0]}
                name="website"
                onChange={this.setCurrentWebsite}
              />
            </div>
          )}
        </Flexbox>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentWebsite: (payload) => dispatch({type: SET_CURRENT_WEBSITE, payload})
  }
}

const mapStateToProps = state => {
  return {
    websites: state.websites,
    currentWebsite: state.currentWebsite,
    availableWebsites: state.availableWebsites,
    dirty: Helpers.safeDataPath(state, "forms.Analytics.filters.dirty"),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuditSiteSelector))
