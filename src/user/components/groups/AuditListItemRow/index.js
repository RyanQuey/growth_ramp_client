import { Component } from 'react';
import { connect } from 'react-redux'
import {
  UPDATE_AUDIT_LIST_ITEM_REQUEST,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form, Checkbox } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { AUDIT_TESTS } from 'constants/auditTests'
import {DIMENSIONS_METRICS_FRIENDLY_NAME} from 'constants/analytics'
import {formActions, alertActions} from 'shared/actions'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'

class AuditListItemRow extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.toggleFixed = this.toggleFixed.bind(this)
  }

  toggleFixed (value) {
    const {item} = this.props
    this.props.updateAuditListItem({
      id: item.id,
      userId: item.userId,
      fixed: value,
      fixedAt: moment().format(),
    })
  }

  render () {
    const { item, listMetadata } = this.props
    return (
      <Flexbox key={item.dimension} justify="space-between" align="center">

        <div>
          <Checkbox onChange={this.toggleFixed} value={item.fixed}/>
          &nbsp;
          {item.dimension}
        </div>
        {Object.keys(listMetadata.metrics).map((metric) =>
          <div key={metric}>{item.metrics[metric]}</div>
        )}
      </Flexbox>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateAuditListItem: (payload) => dispatch({type: UPDATE_AUDIT_LIST_ITEM_REQUEST, payload})
  }
}

const mapStateToProps = state => {
  return {
    auditListItems: state.auditListItems,
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuditListItemRow))
