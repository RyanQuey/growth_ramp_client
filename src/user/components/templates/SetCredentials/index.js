import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { viewSettingActions } from 'shared/actions'
import { Button, Flexbox, Input, Alert } from 'shared/components/elements'
import { UserCredentials } from 'shared/components/partials'
import classes from './style.scss'
import { withRouter } from 'react-router-dom'

class SetCredentials extends Component {
  constructor() {
    super()

    this.state = {
      pending: false
    }
    this.setPending = this.setPending.bind(this)
  }

  setPending() {
    this.setState({pending: true})
  }

  render (){
    const alerts = _.values(this.props.alerts)
    const modalOpen = this.props.currentModal

    return (
      <main>
        {alerts && !modalOpen && alerts.map((alert) => {
          return <Alert key={alert.id} alert={alert} />
        })}

        <h1 color="primary">Welcome</h1>
        <h4>Please set your credentials before continuing:</h4>
        <UserCredentials
          buttonText="Set credentials"
          passwordOnly={this.props.user.email}
          view="SET_CREDENTIALS"
          setPending={this.setPending}
        />
      </main>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    errors: state.errors,
    user: state.user,
    alerts: state.alerts,
  }
}

export default connect(mapStateToProps)(SetCredentials)

