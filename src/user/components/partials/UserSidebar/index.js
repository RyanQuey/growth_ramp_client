import { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Flexbox, MenuItem } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { withRouter } from 'react-router-dom'

import { firebaseActions } from 'shared/actions'
import classes from './Sidebar.scss'

class Sidebar extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {
    return (
      <Flexbox className={classes.sidebar} direction="column" background="black">

        <div className={classes.nav}>
          <ul className={classes.sidebarNav}>
            <MenuItem link="/posts" nav={true}>
              My Posts
            </MenuItem>
            <MenuItem link="/plans" nav={true}>
              My Plans
            </MenuItem>
            <MenuItem link="/providerAccounts" nav={true}>
              My Accounts
            </MenuItem>

            <hr />
            <MenuItem link="/posts/new" >
              New Post
            </MenuItem>
          </ul>
        </div>
      </Flexbox>
    )
  }
}

Sidebar.propTypes = {
  status: PropTypes.string,
}

const mapStateToProps = (state) => {
  return {
    user: state.user }
}

export default withRouter(connect(mapStateToProps)(Sidebar))
