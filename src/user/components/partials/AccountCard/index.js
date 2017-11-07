import { Component } from 'react';
import { connect } from 'react-redux'
import { PROVIDERS } from 'constants/providers'
import { SET_CURRENT_MODAL } from 'constants/actionTypes'
import {
  withRouter,
} from 'react-router-dom'
import { Card, CardHeader, Flexbox, Button } from 'shared/components/elements'
import classes from './style.scss'

class AccountCard extends Component {
  constructor() {
    super()

    this.viewPermissionModal = this.viewPermissionModal.bind(this)
  }

  viewPermissionModal() {
    const cb = () => this.props.setCurrentModal("AccountPermissionsModal", {currentAccount: this.props.account})
    this.props.fetchPermissionsRequest(this.props.account, cb)
  }

  render () {
    const { account, selected, onClick, height, showPermissions } = this.props
    const permittedChannels = Helpers.permittedChannels(account)

    return (
      <Card selected={selected} onClick={onClick} height={height}>
        <CardHeader title={account.userName} subtitle={account.email} headerImgUrl={account.photoUrl}/>

        <div>
          <h4>Current Channel Types:</h4>
          {permittedChannels.length ? (
            <div>
              {permittedChannels.map((channel) => (
                <div key={channel}>{channel.titleCase()}</div>
              ))}
            </div>
          ) : (
            <div>No permitted channels yet</div>
          )}
        </div>

        {showPermissions &&
          <div>
            <Button onClick={this.viewPermissionModal}>View permissions</Button>
          </div>
        }
      </Card>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    providerAccounts: state.providerAccounts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload, options) => dispatch({type: SET_CURRENT_MODAL, payload, options}),
    fetchPermissionsRequest: (account, cb) => dispatch({type: FETCH_PERMISSIONS_REQUEST, payload: {accountId: account.id}, cb}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountCard))
