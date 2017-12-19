import { Component } from 'react'
import { Authenticated, Unauthenticated } from 'user/components/yields'
import { connect } from 'react-redux'
import { Alerts } from 'shared/components/groups'
import { withRouter } from 'react-router-dom'

class User extends Component {
  render() {
    return (
      <div>
        <Alerts />
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

//this component is not used the router, but when you connect, creates a shouldComponentUpdate property which means they will not pass the updated props along to its children, which basically stops this.props.location from being used anywhere down the tree
//in other words, every time you use connect, use  with router...
//until react redux router gets out of beta, and we implement that instead :)
const ConnectedUser = withRouter(connect(mapStateToProps)(User))
export default ConnectedUser
