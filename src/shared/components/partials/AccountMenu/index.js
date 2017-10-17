import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Avatar, Button, MenuItem } from 'shared/components/elements'
import { SIGN_OUT_REQUEST } from 'constants/actionTypes'
import theme from 'theme'
import avatar from 'images/avatar.png'
import classes from './style.scss'
import { userActions } from 'shared/actions'

class UserHeader extends Component {
  constructor(props) {
    super(props)

    this.state = { open: false }

    this.toggleMenu = this.toggleMenu.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }
  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }
  handleClickOutside(e) {
    if (this.refs.wrapperRef && !this.refs.wrapperRef.contains(e.target)) {
      this.setState({ open: false })
    }
  }
  toggleMenu(newState) {
    this.setState({ open: !this.state.open })
  }
  render() {
    const { user, signOut } = this.props

    return (
      <div className={classes.menuCtn} ref="wrapperRef">
        <Avatar
          onClick={this.toggleMenu}
          margin="0 20px"
          padding="5px"
          size="50px"
          src={user && user.photoURL || avatar}
        />

        {this.state.open ? (
          <ul className={`${classes.menuDropdown}}`}>
            <MenuItem link="/profile">Profile</MenuItem>
            <MenuItem link="/">
              <div onClick={signOut}>Sign Out</div>
            </MenuItem>
          </ul>
        ) : (
          <ul></ul>
        )}
      </div>
    )
  }
}

UserHeader.propTypes = {
  user: PropTypes.object,
}

const mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => {dispatch({type: SIGN_OUT_REQUEST})}
  }
}

const mapStateToProps = (state) => {
  return { user: state.user }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserHeader)

