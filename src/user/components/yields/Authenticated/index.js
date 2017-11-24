import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { UserContent, SetCredentials } from 'user/components/templates'
import { Flexbox, Alert } from 'shared/components/elements'
import { UserNavbar, UserSidebar, LinkProviderAccountModal, AccountPermissionsModal, ShowCampaignModal } from 'user/components/partials'
import { } from 'constants/actionTypes'
import { viewSettingActions } from 'shared/actions'
import classes from './style.scss'
import { withRouter } from 'react-router-dom'

class Authenticated extends Component {
  render() {
    const settingCredentials = !this.props.user.password || !this.props.user.email
    return (
      <div>
        <Flexbox direction="column" >
          <UserNavbar userSettingsOnly={settingCredentials}/>
          {settingCredentials? (
            <SetCredentials />
          ) : (
            <Flexbox>
              <UserSidebar />
              <UserContent />
            </Flexbox>
          )}
        </Flexbox>

        <ShowCampaignModal />
        <LinkProviderAccountModal />
        <AccountPermissionsModal />
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
