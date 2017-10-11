import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { 
  Button, 
  Navbar, 
  NavbarBrand, 
  Flexbox, 
  Input, 
  Icon,
} from 'shared/components/elements'
import { AccountMenu } from 'shared/components/partials'
import { SearchBar } from 'user/components/partials'
import { viewSettingActions } from 'shared/actions'
import { StyleSheet, css } from 'aphrodite'
import theme from 'theme'
import classes from './style.scss'

const styles = StyleSheet.create({
  menu: {
    color: theme.color.white,
  },
})

class UserNavbar extends Component {
  constructor(props) {
    super(props)

    this.openLoginModal = this.openLoginModal.bind(this)
  }

  openLoginModal(e) {
    e.preventDefault()
    viewSettingActions.openModal("UserLogin")
  }

  render() {
    const { user } = this.props

    return (
      <Navbar>
        <Flexbox justify="space-between">
          <NavbarBrand/>
        </Flexbox>

        <Flexbox className={classes.mainNav} justify="space-between">
          <Flexbox className={classes.leftNav} align="center" justify="space-between">
            <SearchBar inNavbar={true} />
          </Flexbox>

          <Flexbox className={classes.rightNav} align="center" justify="space-between">
          
            {user ? (
              <AccountMenu />
            ) : (
              <a href="#" onClick={this.openLoginModal}>Login</a>
            )}
          </Flexbox>
        </Flexbox>
      </Navbar>
    )
  }
}

UserNavbar.propTypes = {
  user: PropTypes.object,
}

const mapStateToProps = (state) => {
  return { user: state.user }
}

export default connect(mapStateToProps)(UserNavbar)

