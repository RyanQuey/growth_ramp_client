import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import { CLOSE_MODAL, LINK_ACCOUNT_REQUEST } from 'constants/actionTypes'
import { SocialLogin } from 'shared/components/partials'
import { PermissionRow } from 'user/components/groups'
import { AccountCard } from 'user/components/partials'
import { Button, Form, Card, Flexbox } from 'shared/components/elements'
import { ButtonGroup } from 'shared/components/groups'
import { PROVIDERS } from 'constants/providers'
import classes from './style.scss'


class AccountPermissions extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loginPending: false,
      mode: 'CHOOSE_PROVIDER', //you do this or 'CHOOSE_SCOPE'
      channels: [],
    }

    this.onSuccess = this.onSuccess.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.setPending = this.setPending.bind(this)
    this.chosenScopes = this.chosenScopes.bind(this)
    this.chooseChannel = this.chooseChannel.bind(this)
  }

  handleClose (){
    this.props.closeModal()
  }

  chooseChannel(channel) {
    let channels = this.state.channels

    if (channels.includes(channel)) {
      _.remove(channels, (c) => channel === c)
    } else {
      channels = channels.concat(channel)
    }

    this.setState({channels})
  }

  onSuccess () {
    this.handleClose();

    if (typeof this.props.onSuccess === 'function') {
      this.props.onSuccess();
    }
  }
  setPending() {
    this.setState({loginPending: true})
  }

  chosenScopes() {
    //might make a helper function if I needed anywhere else
    //takes channels and provider and returns the scopes needed for that channel
    const scopes = []
    const provider = this.state.currentProvider

    this.state.channels.forEach((channel) => {
      const newScopes = PROVIDERS[provider].channels[channel].filter((scope) => !scopes.includes(scope))
      scopes.push(...newScopes)
    })

    //removing duplicates
    return scopes
  }

  render (){
    //doesn't allow things to break and actually better performance
    if (!visible) {
      return null
    }

    const account = this.props.currentAccount
    const provider = account.provider
    const visible = this.props.currentModal === "AccountPermissionsModal"
    const permissions = account.permissions || []
    const groupPermissions = []
    const userPermissions = []
    for (let i = 0; i < permissions.length; i++) {
      let permission = permissions[i]
      if (permission.userId) {
        userPermissions.push(permission)
      } else if (permission.userId) {
        groupPermissions.push(permission)
      }
    }


    return (
      <ModalContainer
        visible={visible}
        onClose={this.handleClose}
        title={`Permissions`}
        subtitle={`${account.userName || account.email}'s ${PROVIDERS[provider].name} account`}
      >
        <ModalBody>

            <Form>
              <h3>Current Permissions</h3>
              <Flexbox direction="column">
                <Flexbox >
                  <div className={`${classes.tableHeader} ${classes.columnOne}`}>User</div>
                  <div className={`${classes.tableHeader} ${classes.columnTwo}`}>Access</div>
                  <div className={`${classes.tableHeader} ${classes.columnThree}`}></div>
                </Flexbox>
                {userPermissions.length > 0 ? (
                  userPermissions.map((permission) =>
                    <PermissionRow permission={permission}/>
                  )
                ) : (
                  <div>None so far</div>
                )}
                <hr/>

                <Flexbox >
                  <div className={`${classes.tableHeader} ${classes.columnOne}`}>Workgroup</div>
                  <div className={`${classes.tableHeader} ${classes.columnTwo}`}>Access</div>
                  <div className={`${classes.tableHeader} ${classes.columnThree}`}></div>
                </Flexbox>
                {userPermissions.length > 0 ? (
                  userPermissions.map((permission) =>
                    <PermissionRow permission={permission}/>
                  )
                ) : (
                  <div>None so far</div>
                )}
              </Flexbox>

              <Flexbox justify="center">
                {Object.keys(PROVIDERS[provider].channels).map((channel) =>
                  <Button
                    key={channel}
                    style="inverted"
                    onClick={this.chooseChannel.bind(this, channel)}
                    selected={this.state.channels.includes(channel)}
                  >
                    {channel.titleCase()}
                  </Button>
                )}

              </Flexbox>
                TODO: figure out if will have user permissions

            </Form>
        </ModalBody>
      </ModalContainer>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: (payload) => dispatch({type: CLOSE_MODAL, payload}),
    linkAccountRequest: (payload) => dispatch({type: LINK_ACCOUNT_REQUEST, payload}),
  }
}
const mapStateToProps = (state) => {
  return {
    currentModal: state.viewSettings.currentModal,
    options: state.viewSettings.modalOptions || {},
    currentAccount: Helpers.safeDataPath(state.viewSettings, "modalOptions.currentAccount", {}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountPermissions)
