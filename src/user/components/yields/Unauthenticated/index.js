import { Component } from 'react'
import PropTypes from 'prop-types'
import { Flexbox, Navbar } from 'shared/components/elements'
import classes from './style.scss'
import { UserLoginModal, UserNavbar, UserSidebar, UserContent } from 'user/components/partials'
import { Footer } from 'user/components/groups'
import { withRouter } from 'react-router-dom'
import { UnauthenticatedContent } from 'user/components/templates'

//TODO: this will be the picture with the library and search box in the middle
class Unauthenticated extends Component {
  componentDidMount() {
    /* add this back in if can make sure this doesn't happen while user is still loading
    if (this.props.location.pathname !== "/") {
      this.props.history.push("/")
    }
    */
  }

  render() {
    return (
      <div style={{position: "relative", "padding-bottom": "30px"}}>
        <Flexbox direction="column">
          <UserNavbar userSettingsOnly={true}/>
          <UnauthenticatedContent />
        </Flexbox>

        <Footer />
        <UserLoginModal />
      </div>
    )
  }
}

Unauthenticated.propTypes = {
}

export default withRouter(Unauthenticated)
