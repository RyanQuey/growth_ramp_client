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
import { Logo } from 'shared/components/elements'
import {SET_CURRENT_MODAL, CREATE_POST_REQUEST} from 'constants/actionTypes'
import theme from 'theme'
import classes from './style.scss'

class UserNavbar extends Component {
  constructor(props) {
    super(props)

    this.openLoginModal = this.openLoginModal.bind(this)
  }

  openLoginModal(e) {
    e.preventDefault()
    this.props.setCurrentModal("UserLoginModal")
  }

  render() {
    const { user } = this.props

    return (
      <Navbar className={classes.header}>
        {false && <Flexbox justify="space-between">
          <NavbarBrand/>
        </Flexbox>}

        <Flexbox className={classes.mainNav} justify="space-between">
          <Flexbox className={classes.leftNav} align="center" justify={user ? "space-around" : "flex-start" }>
            <Link to="/">
              <Logo />
            </Link>

            {user && <Button onClick={this.props.createPostRequest}>
              <Link to="/posts/new">
                New post
              </Link>
            </Button>}
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

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    createPostRequest: (currentUser) => {
      const newPost = {
        userId: store.getState().user.id,
      }

      return dispatch({type: CREATE_POST_REQUEST, payload: newPost})
    },
  }
}
const mapStateToProps = (state) => {
  return { user: state.user }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserNavbar)

