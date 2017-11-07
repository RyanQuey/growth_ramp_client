import { Component } from 'react';
import { connect } from 'react-redux'
import { PROVIDERS } from 'constants/providers'
import { SET_CURRENT_MODAL } from 'constants/actionTypes'
import {
  withRouter,
} from 'react-router-dom'
import { Card, CardHeader, Flexbox, Button } from 'shared/components/elements'
import classes from './style.scss'

class WorkgroupCard extends Component {
  constructor() {
    super()

    this.switchToWorkgroup = this.switchToWorkgroup.bind(this)
  }

  switchToWorkgroup() {

  }

  render () {
    const { workgroup } = this.props
    //don't really need this data, so not populating that data yet. If you switch, show members etc then
    //const members = workgroup.members || []

    return (
      <Card height="130px">
        <CardHeader title={workgroup.name} />

        <div>
        </div>

        <Flexbox justify="center">
          <Button onClick={this.switchToWorkgroup}>Switch to workgroup</Button>
        </Flexbox>
      </Card>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload, options) => dispatch({type: SET_CURRENT_MODAL, payload, options}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WorkgroupCard))
