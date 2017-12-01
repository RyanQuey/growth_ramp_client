import { Component } from 'react'
import PropTypes from 'prop-types'
import {
  withRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
import { Alert, Flexbox } from 'shared/components/elements'
import { Home, Plans, ShowPlan, ShowCampaign, EditCampaign, Campaigns, Providers, ShowProvider, Workgroups } from 'user/components/templates'
import requireAuthenticated from 'lib/requireAuthenticated'
import forbidAuthenticated from 'lib/forbidAuthenticated'
import { connect } from 'react-redux'
import classes from './style.scss'

class UserContent extends Component {
  render() {
    const alerts = _.values(this.props.alerts)
    const modalOpen = this.props.currentModal

    return (
      <main className={classes.userContent}>
        <Flexbox className={classes.rightColumn} direction="column">
          {alerts && !modalOpen && alerts.map((alert) => {
            return <Alert key={alert.id} alert={alert} />
          })}

          <Switch>
            <Route exact path="/" render={() => (<Redirect to="/campaigns"/>)} />
            <Route path="/campaigns/:campaignId/edit" component={EditCampaign} />
            <Route path="/campaigns/:campaignId" component={ShowCampaign} />
            <Route path="/campaigns" component={Campaigns} />
            <Route path="/plans/:planId/:editing?" component={ShowPlan} />
            <Route path="/plans" component={Plans} />
            <Route path="/providerAccounts/:provider" component={ShowProvider} />
            <Route path="/providerAccounts/:provider?" component={Providers} />
            {false && <Route path="/workgroups" component={Workgroups} />}
          </Switch>
        </Flexbox>
      </main>
    )
  }
}

UserContent.propTypes = {
  history: PropTypes.object,
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    alerts: state.alerts,
    currentModal: state.viewSettings.currentModal,
  }
}

export default withRouter(connect(mapStateToProps)(UserContent))

