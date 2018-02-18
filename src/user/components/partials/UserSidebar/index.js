import { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Flexbox } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { withRouter } from 'react-router-dom'
import { MenuChild, MenuItem } from 'shared/components/groups'
import { SET_CURRENT_MODAL } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'

import classes from './style.scss'

class UserSidebar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      providerAccounts: false
    }

    this.openNewProviderModal = this.openNewProviderModal.bind(this)
  }

  handleClick(menuItem, e) {
    e.preventDefault()
    switch(menuItem) {
      case "trafficDashboard":
        this.setState({trafficDashboard: !this.state.trafficDashboard})
        break
      case "providerAccounts":
        this.setState({providerAccounts: !this.state.providerAccounts})
        break
    }
  }

  openNewProviderModal() {
    this.props.setCurrentModal("LinkProviderAccountModal")
  }

  render() {
    return (
      <Flexbox className={classes.sidebar} direction="column" background="">

        <div className={classes.nav}>
          <ul className={classes.sidebarNav}>
            <MenuItem link="/campaigns" text="Campaigns" nav={true} exact={true} icon="bullhorn"/>
            <MenuItem link="/plans" text="Plans" nav={true} icon="map"/>
            <MenuItem link={false && "/providerAccounts"} text="Platforms" selected={this.state.providerAccounts} onClick={this.handleClick.bind(this, "providerAccounts")} icon="vcard">
              <ul>
                {Object.keys(this.props.providerAccounts).filter((provider) =>
                  !PROVIDERS[provider] ||
                  !PROVIDERS[provider].notForPublishing ||
                  //this is for google. If they have linked google account, might not be any channels; only have channels if they make custom ones at this point
                  (this.props.providerAccounts[provider].some((account) => account.channels && account.channels.length))
                ).map((providerName) => (
                  <MenuChild key={providerName} text={Helpers.providerFriendlyName(providerName)} link={`/providerAccounts/${providerName.toLowerCase()}`} nav={true} icon={providerName.toLowerCase()}/>
                ))}
                <MenuChild text="New Account" onClick={this.openNewProviderModal} link={false && `/providerAccounts`} icon="plus-circle"/>
              </ul>
            </MenuItem>

            <MenuItem link={false && "/analytics"} text="Traffic Dashboard" selected={this.state.trafficDashboard} onClick={this.handleClick.bind(this, "trafficDashboard")} icon="bar-chart">
              <ul>
                <MenuChild text="Website Traffic" link={`/analytics/website-traffic`} nav={true} icon={""}/>
                <MenuChild text="Webpage Traffic" link={`/analytics/webpage-traffic`} nav={true} icon={""}/>
              </ul>
            </MenuItem>
            {false && <MenuItem link="/workgroups" text="Workgroups" nav={true} icon="users"/>}

          </ul>
        </div>
      </Flexbox>
    )
  }
}

UserSidebar.propTypes = {
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload})
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    providerAccounts: state.providerAccounts,
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserSidebar))
