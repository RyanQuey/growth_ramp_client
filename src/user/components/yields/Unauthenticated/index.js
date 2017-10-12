import { Component } from 'react'
import PropTypes from 'prop-types'
import { Flexbox, Navbar } from 'shared/components/elements'
import classes from './Unauthenticated.scss'
import { UserLoginModal, UserNavbar, UserSidebar, UserContent } from 'user/components/partials'
import { Home } from 'user/components/templates'

//TODO: this will be the picture with the library and search box in the middle
class Unauthenticated extends Component {

  render() {
    return (
      <div>
        <Flexbox direction="column">
          <UserNavbar />
          <Home />
        </Flexbox>

        <UserLoginModal />
      </div>
    )
  }
}

Unauthenticated.propTypes = {
}

export default Unauthenticated
