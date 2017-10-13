import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { UserContent } from 'user/components/templates'
import { Flexbox, Alert } from 'shared/components/elements'
import { UserNavbar, UserSidebar } from 'user/components/partials'
import { FETCH_POST_REQUEST, FETCH_PLAN_REQUEST, FETCH_USER_REQUEST, UPDATE_TOKEN_REQUEST, IS_PRELOADING_STORE, OPEN_MODAL } from 'constants/actionTypes'
import { viewSettingActions } from 'shared/actions'
import classes from './Authenticated.scss'
import { withRouter } from 'react-router-dom'

class Authenticated extends Component {
  componentDidMount () {
    if (this.props.user && !this.props.user.password) {
      this.props.history.push("/SetPassword")
    }
  }
  componentWillReceiveProps (props) {
    if (props.user && !props.user.password) {
      this.props.history.push("/SetPassword")
    }
  }
  render() {
    return (
      <div>
        <Flexbox direction="column">
          <UserNavbar />
          <Flexbox>
            <UserSidebar />
            <UserContent />
          </Flexbox>
        </Flexbox>

      </div>
    )
  }
}

Authenticated.propTypes = {
}

// can be passed in as { signInRequest } into connect as a shortcut, but learning the long way for now until I can get used to it, and know how to modify the dispatches for later on
const mapStateToProps = (state) => {
  return {
    user: state.user,
    alerts: state.alerts,
  }
}

export default withRouter(connect(mapStateToProps)(Authenticated))
