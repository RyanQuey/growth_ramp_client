import { Component } from 'react'
import PropTypes from 'prop-types'
import {
  withRouter,
  Route,
  Switch,
} from 'react-router-dom'
import { Flexbox } from 'shared/components/elements'
import { Footer } from 'user/components/groups'
import { LandingPage } from 'user/components/templates'
import requireAuthenticated from 'lib/requireAuthenticated'
import forbidAuthenticated from 'lib/forbidAuthenticated'
import { connect } from 'react-redux'
import classes from './style.scss'

class UnauthenticatedContent extends Component {
  render() {

    return (
      <main className={classes.unauthenticatedContent}>
        <Flexbox className={classes.rightColumn} direction="column">

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
    currentModal: state.viewSettings.currentModal,
  }
}

export default withRouter(connect(mapStateToProps)(UnauthenticatedContent))

