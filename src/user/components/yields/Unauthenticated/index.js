import { Component } from 'react'
import PropTypes from 'prop-types'
import { Flexbox, Navbar } from 'shared/components/elements'
import classes from './style.scss'
import { UserLoginView, UserNavbar, UserSidebar, UserContent } from 'user/components/partials'
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
    // if ?signup=true in query, start with signup view
    const queryVariables = this.props.location.search.replace(/^\?/, "").split('&')
    const signupVar = queryVariables.find((set) => set.includes("signup="))
    let signup
    if (signupVar) {
      try {
        const pair = signupVar.split('=')
        const value = decodeURIComponent(pair[1])
        signup = value === "true"

      } catch (err) {console.error(err);}

    }
    return (
      <div className={classes.mainContainer}>
        <UserNavbar noLinks={true}/>
        <UserLoginView
          initialView={signup ? "SIGN_UP" : "LOGIN"}
        />
      </div>
    )
  }
}

Unauthenticated.propTypes = {
}

export default withRouter(Unauthenticated)
