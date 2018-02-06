import { Component } from 'react';
import { connect } from 'react-redux'
import {
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon } from 'shared/components/elements'
import {
} from 'user/components/partials'
import { SocialLogin } from 'shared/components/partials'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'

class ViewAnalytics extends Component {
  constructor() {
    super()
    this.state = {
      pending: true,
    }

    this.refreshGAAccounts = this.refreshGAAccounts.bind(this)
  }

  componentWillMount() {
    this.refreshGAAccounts()
  }

  refreshGAAccounts() {
    const cb = () => {
      this.setState({pending: false})
    }

    this.setState({pending: true})
    this.props.fetchAllGAAccounts({}, cb)
  }

  render () {
    const {googleAccounts, websites} = this.props
    const {pending} = this.state
    const currentGoogleAccount = googleAccounts && googleAccounts[0]

    return (
      <div>
        <h1>Analytics</h1>

        {currentGoogleAccount ? (
          <div>
            {currentGoogleAccount.userName}
            {pending ? (
              <Icon name="spinner"/>
            ) : (
              Object.keys(websites).length ? (
                <div>Pick a website
                  {Object.keys(websites).map((url) => <div key={url}>{url}</div>)}
                </div>

              ) : (
                <div>No websites connected to your google account. </div>
              )
            )}
          </div>
        ) : (
          <SocialLogin
            pending={this.state.pending}
            togglePending={this.togglePending}
            providers={_.pick(PROVIDERS, "GOOGLE")}
          />
        )}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllGAAccounts: (payload, cb) => dispatch({type: FETCH_ALL_GA_ACCOUNTS_REQUEST, payload, cb})
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    campaigns: state.campaigns,
    googleAccounts: Helpers.safeDataPath(state, "providerAccounts.GOOGLE", []).filter((account) => !account.unsupportedProvider),
    websites: state.websites,
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewAnalytics))
