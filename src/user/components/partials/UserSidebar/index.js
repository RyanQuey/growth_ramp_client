import { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Flexbox } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { withRouter } from 'react-router-dom'
import { MenuChild, MenuItem } from 'shared/components/groups'

import classes from './style.scss'

class UserSidebar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      providerAccounts: false
    }
  }

  handleClick(menuItem, e) {
    e.preventDefault()
    switch(menuItem) {
      case "providerAccounts":
        if (Object.keys(this.props.providerAccounts).length) {

          this.setState({providerAccounts: true})
        }
        break
    }
  }
  render() {
    return (
      <Flexbox className={classes.sidebar} direction="column" background="black">

        <div className={classes.nav}>
          <ul className={classes.sidebarNav}>
            <MenuItem link="/posts" text="My Posts" nav={true} />
            <MenuItem link="/plans" text="My Plans" nav={true} />
            <MenuItem link="/providerAccounts" text="My Accounts" nav={true} onClick={this.handleClick.bind(this, "providerAccounts")}>
              {(true || this.state.providerAccounts) && (
                <ul>
                  {Object.keys(this.props.providerAccounts).map((providerName) => (
                    <MenuChild key={providerName} text={providerName} link={`/providerAccounts/${providerName}`} nav={true}/>
                  ))}
                  <MenuChild text="New Provider" link={`/providerAccounts/new`} nav={true} badge="+"/>
                </ul>
              )}
            </MenuItem>

            <hr />
            <MenuItem link="/posts/new" text="New Post" />
          </ul>
        </div>
      </Flexbox>
    )
  }
}

UserSidebar.propTypes = {
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    providerAccounts: state.providerAccounts,
  }
}

export default withRouter(connect(mapStateToProps)(UserSidebar))
