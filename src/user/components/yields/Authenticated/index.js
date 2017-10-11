import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Home, Profile, SignUp } from 'user/components/templates'
import { Flexbox, Alert } from 'shared/components/elements'
import { UserNavbar, UserSidebar, SetPassword } from 'user/components/partials'
import { FETCH_POST_REQUEST, FETCH_PLAN_REQUEST, FETCH_USER_REQUEST, UPDATE_TOKEN_REQUEST, IS_PRELOADING_STORE } from 'constants/actionTypes'
import classes from './Authenticated.scss'
import { BrowserRouter } from 'react-router-dom'

class Authenticated extends Component {
  componentDidMount () {
          const userData = Helpers.extractUserData(this.props.user)
          this.props.userFetchRequest(userData)
          this.props.postFetchRequest(userData)
          this.props.planFetchRequest(userData)

          let userProviders = []
          userData.providerData && userData.providerData.forEach((provider) => {
            userProviders.push(provider.providerId)
          })
          if (userProviders.length > 0) {
            this.props.tokenUpdateRequest({providerIds: userProviders})
          }

  }
  render() {
    const { children } = this.props
    return (
      <BrowserRouter>
        <Flexbox direction="column">
          <UserNavbar />

          <Flexbox>
            {this.props.user.password ? (
              <div>
                <UserSidebar />

                <UserContent />
              </div>
            ) : (
              <SetPassword />
            )}
          </Flexbox>
        </Flexbox>
      </BrowserRouter>
    )
  }
}

Authenticated.propTypes = {
  children: PropTypes.node.isRequired,
}

// can be passed in as { signInRequest } into connect as a shortcut, but learning the long way for now until I can get used to it, and know how to modify the dispatches for later on
const mapDispatchToProps = (dispatch) => {
  return {
    userFetchRequest: (data) => dispatch({type: FETCH_USER_REQUEST, payload: data}),
    postFetchRequest: (data) => dispatch({type: FETCH_POST_REQUEST, payload: data}),
    planFetchRequest: (data) => dispatch({type: FETCH_PLAN_REQUEST, payload: data}),
    tokenUpdateRequest: (data) => dispatch({type: UPDATE_TOKEN_REQUEST, payload: data}),
    isPreloadingStore: (data) => dispatch({type: IS_PRELOADING_STORE, payload: data}),
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    alerts: state.alerts,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Authenticated)
