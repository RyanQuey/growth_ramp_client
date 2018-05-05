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
import {SET_CURRENT_MODAL, CREATE_CAMPAIGN_REQUEST} from 'constants/actionTypes'
import {formActions} from 'shared/actions'
import classes from './style.scss'
import theme from 'theme'
import logo from 'images/growth-ramp-logos/GR_side_logo_white.png'

class UnauthenticatedNavbar extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {  } = this.props

    return (
      <div className={`${classes.header}`}>
        <Flexbox className={classes.mainNav} justify={"center"}>
          <Flexbox className={classes.leftNav} align="center" justify={"center"}>
          </Flexbox>

          <Flexbox className={classes.centerNav} align="center" justify={"center"}>
            <Link to="/">
              <img alt="logo" src={logo} />
            </Link>
          </Flexbox>

          <Flexbox className={classes.rightNav} align="center" justify="space-between">
            {false && (
              <div>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
              </div>
            )}

            <div>
              {false && <a href="#" onClick={this.openLoginModal.bind(this, "login")}>Login</a>}
              {false && "will add later.." && <a href="#" onClick={this.openLoginModal.bind(this, "signup")}>Signup</a>}
            </div>
          </Flexbox>
        </Flexbox>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UnauthenticatedNavbar))

