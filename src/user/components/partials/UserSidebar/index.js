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
                {Object.keys(this.props.providerAccounts).map((providerName) => (
                  <MenuChild key={providerName} text={PROVIDERS[providerName].name} link={`/providerAccounts/${providerName.toLowerCase()}`} nav={true} icon={providerName.toLowerCase()}/>
                ))}
                <MenuChild text="New Account" onClick={this.openNewProviderModal} link={false && `/providerAccounts`} icon="plus-circle"/>
              </ul>
            </MenuItem>
            {false && <MenuItem link="/analytics" text="Analytics" nav={true} icon="bar-chart"/>}
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
