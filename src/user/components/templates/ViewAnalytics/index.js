import { Component } from 'react';
import { connect } from 'react-redux'
import {
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
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value}) //only for social login so far
  }

  componentWillMount() {
  }

  render () {
    const {pending} = this.state
    const {googleAccounts, match} = this.props
    const currentGoogleAccount = googleAccounts && googleAccounts[0]
    //getting dataset/what the analytics dashboard view and filters are on this component.
    //For now, can do it all from the path, but might have to change later
    const {dataset} = match.params

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
          />
        ) : (
          <div/>
        )}

        <AnalyticsTable
          dataset={dataset}
        />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
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
