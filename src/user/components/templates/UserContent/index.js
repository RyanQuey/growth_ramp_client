import { Component } from 'react'
import PropTypes from 'prop-types'
import {
  withRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
import { Alert, Flexbox } from 'shared/components/elements'
import { ContactUsButton } from 'shared/components/groups'
import { UserSettings } from 'shared/components/templates'
import { Home, ViewPlans, ShowPlan, ShowCampaign, EditCampaign, ViewAnalytics, ViewCampaigns, Providers, ShowProvider, Workgroups } from 'user/components/templates'
import { Footer } from 'user/components/groups'
import requireAuthenticated from 'lib/requireAuthenticated'
import forbidAuthenticated from 'lib/forbidAuthenticated'
import { connect } from 'react-redux'
import classes from './style.scss'

class UserContent extends Component {
  render() {
    return (
      <main className={classes.userContent}>
        <Flexbox className={classes.rightColumn} direction="column">
          <Switch>
            <Route exact path="/" render={() => (<Redirect to="/campaigns"/>)} />
            <Route path="/campaigns/:campaignId/edit" component={EditCampaign} />
            <Route path="/campaigns/:campaignId" component={ShowCampaign} />
            <Route path="/campaigns" component={ViewCampaigns} />
            <Route path="/plans/:planId/:editing?" component={ShowPlan} />
            <Route path="/plans" component={ViewPlans} />
            {false && <Route path="/analytics" component={ViewAnalytics} />}
            <Route path="/providerAccounts/:provider" component={ShowProvider} />
            <Route path="/settings/:view?" component={UserSettings} />
            {false && <Route path="/providerAccounts/:provider?" component={Providers} />}
            {false && <Route path="/workgroups" component={Workgroups} />}
          </Switch>
        </Flexbox>

        <ContactUsButton />

        <Footer />
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
  }
}

export default withRouter(connect(mapStateToProps)(UserContent))

