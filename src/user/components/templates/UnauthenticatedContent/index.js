import { Component } from 'react'
import PropTypes from 'prop-types'
import {
  withRouter,
  Route,
  Switch,
} from 'react-router-dom'
import { Alert, Flexbox } from 'shared/components/elements'
import { Footer } from 'user/components/groups'
import { LandingPage } from 'user/components/templates'
import requireAuthenticated from 'lib/requireAuthenticated'
import forbidAuthenticated from 'lib/forbidAuthenticated'
import { connect } from 'react-redux'
import classes from './style.scss'

class UnauthenticatedContent extends Component {
  render() {
    const alerts = _.values(this.props.alerts)
    const modalOpen = this.props.currentModal

    return (
      <main className={classes.unauthenticatedContent}>
        <Flexbox className={classes.rightColumn} direction="column">
          {alerts && !modalOpen && alerts.map((alert) => {
            return <Alert key={alert.id} alert={alert} />
          })}

          <Switch>
            <Route path="/" component={LandingPage} />
          </Switch>
        </Flexbox>
        <Footer />
      </main>
    )
  }
}

UnauthenticatedContent.propTypes = {
  history: PropTypes.object,
}
const mapStateToProps = (state) => {
  return {
    alerts: state.alerts,
    currentModal: state.viewSettings.currentModal,
  }
}

export default withRouter(connect(mapStateToProps)(UnauthenticatedContent))

