import { Component } from 'react';
import { connect } from 'react-redux'
import { PROVIDERS } from 'constants/providers'
import { SET_CURRENT_MODAL, FETCH_CURRENT_ACCOUNT_REQUEST } from 'constants/actionTypes'
import {
  withRouter,
} from 'react-router-dom'
import { Card, CardHeader, Flexbox, Button } from 'shared/components/elements'
import classes from './style.scss'

class AccountCard extends Component {
  constructor() {
    super()

    this.viewModal = this.viewModal.bind(this)
  }

  viewModal() {
//    const cb = () => {
this.props.setCurrentModal("ShowAccountModal", {currentAccount: this.props.account})//}


//    this.props.fetchCurrentAccountRequest(this.props.account, cb)
  }

  render () {
    const { account, selected, onClick, height = "230px", detailsButton } = this.props
    const permittedChannelTypes = Helpers.permittedChannelTypes(account)

    return (
      <Card selected={selected} onClick={onClick} height={height}>
        <CardHeader title={account.userName} subtitle={account.email || "(no email on file)"} headerImgUrl={account.photoUrl}/>

        <div>
          <h4>Current Channel Types:</h4>
          {permittedChannelTypes.length ? (
            <div>
              {permittedChannelTypes.map((channelType) => (
                <div key={channelType}>{channelType.titleCase()}</div>
              ))}
            </div>
          ) : (
            <div>No permitted channels yet</div>
          )}
        </div>

        {detailsButton &&
          <div>
            <Button onClick={this.viewModal}>View Details</Button>
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
//    fetchCurrentAccountRequest: (account, cb) => dispatch({type: FETCH_CURRENT_ACCOUNT_REQUEST, payload: {accountId: account.id}, cb}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountCard))
