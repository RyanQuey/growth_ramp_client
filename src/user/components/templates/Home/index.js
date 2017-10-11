import { Component } from 'react'
import PropTypes from 'prop-types'
import { Heading } from 'shared/components/elements'
import { SignIn } from 'shared/components/partials'
import { connect } from 'react-redux'

class Home extends Component {
  render() {
    const { user } = this.props
    return (
      <div id="home-ctn">
        <div className="menu-ctn">
        </div>
        <h1>You are Home</h1>
        <h5>You should login!</h5>
      </div>
    )
  }
}

Home.propTypes = {
  history: PropTypes.object,
  user: PropTypes.object,
}

const mapStateToProps = (state) => {
  return { user: state.user }
}

export default connect(mapStateToProps)(Home)

