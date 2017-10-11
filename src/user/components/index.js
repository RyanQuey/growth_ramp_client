import { Component } from 'react'
import { Authenticated, Unauthenticated } from 'user/components/yields'
import { connect } from 'react-redux'

class User extends Component {
  componentDidMount() {
  }
  render() {
    return (
      <div>
        {this.props.user ? (
          <Authenticated />
        ) : (
          <Unauthenticated />
        )}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
  }
}

const ConnectedUser = connect(mapStateToProps)(User)
export default ConnectedUser
