import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Home, Profile, SignUp } from 'user/components/templates'
import { Flexbox, Alert } from 'shared/components/elements'
import { UserNavbar, UserSidebar, UserContent, SetPasswordModal } from 'user/components/partials'
import { FETCH_POST_REQUEST, FETCH_PLAN_REQUEST, FETCH_USER_REQUEST, UPDATE_TOKEN_REQUEST, IS_PRELOADING_STORE } from 'constants/actionTypes'
import { viewSettingActions } from 'shared/actions'
import classes from './Authenticated.scss'
import { BrowserRouter } from 'react-router-dom'

class Authenticated extends Component {
  componentDidMount () {
  }
  componentWillReceiveProps (props) {
    if (props.user && !props.user.password) {
      viewSettingActions.openModal("SetPasswordModal")
    }
  }
  render() {
    const { children } = this.props
    return (
      <div>
        <Flexbox direction="column">
          <UserNavbar />
          <Flexbox>
            <div>
              <UserSidebar />
              <UserContent />
            </div>
          </Flexbox>
        </Flexbox>

        <SetPasswordModal />
      </div>
    )
  }
}

Authenticated.propTypes = {
}

// can be passed in as { signInRequest } into connect as a shortcut, but learning the long way for now until I can get used to it, and know how to modify the dispatches for later on
const mapDispatchToProps = (dispatch) => {
  return {
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    alerts: state.alerts,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Authenticated)
