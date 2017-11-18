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
import theme from 'theme'
import classes from './style.scss'

class UserNavbar extends Component {
  constructor(props) {
    super(props)

    this.openLoginModal = this.openLoginModal.bind(this)
    this.createCampaign = this.createCampaign.bind(this)
  }

  createCampaign() {
    //to run on success
    const cb = (newCampaign) => {
      this.props.history.push(`/campaigns/${newCampaign.id}/edit`)
    }

    this.props.createCampaignRequest(cb)
  }

  openLoginModal(e) {
    e.preventDefault()
    this.props.setCurrentModal("UserLoginModal")
  }

  render() {
    const { user, userSettingsOnly } = this.props

    return (
      <Navbar className={classes.header}>
        {false && <Flexbox justify="space-between">
          <NavbarBrand/>
        </Flexbox>}

        <Flexbox className={classes.mainNav} justify="space-between">
          <Flexbox className={classes.leftNav} align="center" justify={!userSettingsOnly ? "space-around" : "flex-start" }>
            <Link to="/">
              <Logo />
            </Link>

            {!userSettingsOnly && <Button onClick={this.createCampaign}>
              New Campaign
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
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    createCampaignRequest: (cb) => {
      const newCampaign = {
        userId: store.getState().user.id,
      }

      return dispatch({type: CREATE_CAMPAIGN_REQUEST, payload: newCampaign, cb})
    },
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    form: state.form,
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserNavbar))

