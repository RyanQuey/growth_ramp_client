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
      pending: true,
      analyticsPending: false,
    }


    this.togglePending = this.togglePending.bind(this)
  }

  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  componentWillMount() {
  }

  render () {
    const {pending} = this.state
    const {googleAccounts} = this.props
    const currentGoogleAccount = googleAccounts && googleAccounts[0]

    return (
      <div>
        <h1>Analytics</h1>

        {currentGoogleAccount ? (
          <AnalyticsFilters
            togglePending={this.togglePending}
          />
        ) : (
          <SocialLogin
            pending={this.state.pending}
            togglePending={this.togglePending}
            providers={_.pick(PROVIDERS, "GOOGLE")}
          />
        )}

        <AnalyticsTable
          dataset="websiteSummary"
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
