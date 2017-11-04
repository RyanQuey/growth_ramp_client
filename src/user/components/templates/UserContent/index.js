import { Component } from 'react'
import PropTypes from 'prop-types'
import {
  withRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
import { Alert, Flexbox } from 'shared/components/elements'
import { Home, SetCredentials, Plans, Posts, ProviderAccounts } from 'user/components/templates'
import requireAuthenticated from 'lib/requireAuthenticated'
import forbidAuthenticated from 'lib/forbidAuthenticated'
import { connect } from 'react-redux'
import classes from './style.scss'

class UserContent extends Component {
  render() {
    const alerts = _.values(this.props.alerts)
    const modalOpen = this.props.currentModal

    return (
      <main>
        <Flexbox className={classes.rightColumn} direction="column">
          {alerts && !modalOpen && alerts.map((alert) => {
            return <Alert key={alert.id} alert={alert} />
          })}

          <Switch>
            <Route exact path="/" render={() => (this.props.user ? <Redirect to="/posts"/> : <Home />)} />
            <Route path="/posts" component={Posts} />
            <Route path="/plans" component={Plans} />
            <Route path="/providerAccounts/:provider?" component={ProviderAccounts} />
            <Route path="/SetCredentials" component={SetCredentials} />
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

