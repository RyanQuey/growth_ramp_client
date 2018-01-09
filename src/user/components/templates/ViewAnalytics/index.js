import { Component } from 'react';
import { connect } from 'react-redux'
import { } from 'constants/actionTypes'
import { Button, Flexbox } from 'shared/components/elements'
import {
} from 'user/components/partials'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'

class ViewAnalytics extends Component {
  constructor() {
    super()
    this.state = {
      status: "pending",
    }

  }

  componentWillMount() {
    this.props.fetchAnalyticRequest({userId: this.props.user.id})
  }

  componentWillReceiveProps(props) {
  }


  render () {
    return (
      <div>
        <h1>Analytics</h1>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    campaigns: state.campaigns,
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewAnalytics))
