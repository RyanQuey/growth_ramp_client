import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import { CLOSE_MODAL, CREATE_FAKE_ACCOUNT_REQUEST, CREATE_FAKE_CHANNEL_REQUEST } from 'constants/actionTypes'
import { SocialLogin } from 'shared/components/partials'
import { AccountCard } from 'user/components/partials'
import { Input, Button, Form, Card, Flexbox, Icon } from 'shared/components/elements'
import { ButtonGroup, Select } from 'shared/components/groups'
import { PROVIDERS } from 'constants/providers'
import { errorActions, alertActions } from 'shared/actions'
import classes from './style.scss'

class AddFakeProviderAccount extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pending: false,
      currentProvider: "",
      currentAccount: null,
      channelTypes: [],
      email: "",
      userName: "",
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleChooseAccount = this.handleChooseAccount.bind(this)
    this.togglePending = this.togglePending.bind(this)
    this.chooseProvider = this.chooseProvider.bind(this)
    this.chooseChannel = this.chooseChannel.bind(this)
    this.handleParam = this.handleParam.bind(this)
    this.submit = this.submit.bind(this)
    this._createFakeChannel = this._createFakeChannel.bind(this)
    this.handleInputErrors = this.handleInputErrors.bind(this)
    this.checkForRequired = this.checkForRequired.bind(this)
  }

  handleParam(key, value) {
    this.setState({[key]: value})
  }

  //not really doing anything yet
  handleInputErrors(key, errs) {
    let errors = Object.assign({}, this.state.errors || {})
    errors[key] = errs

    this.setState({errors})
  }

  handleClose (){
    this.props.closeModal()
  }

  handleChooseAccount(accountOption) {
    this.setState({
      currentAccount: accountOption.value,
    })
  }

  checkForRequired() {
    let {channelTypes, currentProvider, currentAccount} = this.state
    // get all the rquired fields
    const requiredFields = currentAccount ? [] : ["userName"]

    for (let channelType of channelTypes) {
      const hasMultiple = Helpers.channelTypeHasMultiple(null, currentProvider, channelType)
      const hasForums = Helpers.channelTypeHasForums(null, currentProvider, channelType)

      if (hasMultiple) {
        requiredFields.push(`${channelType}-channelName`)
      }
      if (hasForums) {
        requiredFields.push(`${channelType}-forumName`)
      }
    }

    // test all
    for (let field of requiredFields) {
console.log(field);
      if (!this.state[field]) {
        return false
      }
    }

    return true
  }

  chooseProvider(provider) {
    const newState = {
      mode: 'CHOOSE_SCOPE',
      currentProvider: provider,
      currentAccount: null,
      channelTypes: [],
    }

    const accountsForProvider = this.props.providerAccounts[provider]
    newState.currentAccount = accountsForProvider ? null : "new"
    this.setState(newState)
  }

  chooseChannel(channelType) {
    let channelTypes = this.state.channelTypes

    if (channelTypes.includes(channelType)) {
      _.remove(channelTypes, (c) => channelType === c)
    } else {
      channelTypes = channelTypes.concat(channelType)
    }

    this.setState({channelTypes})
  }

  accountOption(account) {
    return {
      label: `${account.userName || "no username"} (${account.email || "no email"})`,
      value: account,
    }
  }

  _createFakeChannel(params) {
    return new Promise((resolve, reject) => {
      const onFailure = () => {
        return reject()
      }
      const cb = () => {
        return resolve()
      }

      this.props.addFakeChannelRequest(params, cb, onFailure)
    })
  }

  submit(e) {
console.log("submitting");
    e.preventDefault()

    const passedRequiredValidation = this.checkForRequired()
    if (!passedRequiredValidation) {
      alertActions.newAlert({
        title: "Please fill out required fields",
        level: "DANGER",
        options: {}
      })

      return
    }

    this.togglePending(true)

    const {currentProvider, currentAccount, userName, email, channelTypes, photoUrl} = this.state

    const cb = (fakeAcct) => {
      const newChannelNames = Object.keys(this.state).filter((stateProp) => stateProp.includes("-name"))

      const promises = []

      // create a new channel for each one specified
      for (let channelType of channelTypes) {
        const channelParams = {
          userId: store.getState().user.id,
          provider: currentProvider,
          name: this.state[`${channelType}-channelName`],
          providerAccountId: fakeAcct.id,
          unsupportedChannel: true,
          forumName: this.state[`${channelType}-forumName`],
          type: channelType,
        }
        promises.push(this._createFakeChannel(channelParams))
      }

      Promise.all(promises)
      .then(() => {
        this.togglePending(false)
        this.handleClose();
      })
      .catch((err) => {
        console.error(err);
        this.togglePending(false)
      })
    }


    if (currentAccount === "new") {
      const accountParams = {
        provider: currentProvider,
        userName,
        email,
        userId: store.getState().user.id,
        photoUrl,
        unsupportedProvider: true,
      }

      // make account first, to get the primary key
      this.props.addFakeAccountRequest(accountParams, cb)

    } else {
      cb(currentAccount)
    }



  }
  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  render (){
    const {currentProvider, currentAccount, errors} = this.state
    const currentProviderName = currentProvider && PROVIDERS[currentProvider].name

    const accountsForProvider = this.props.providerAccounts[currentProvider] || []
    const accountOptions = accountsForProvider.map((a) => (
      this.accountOption(a)
    ))

    accountOptions.unshift({label: "Create New Account", value: "new"})

    const placeholder = {label: "select", value: null}

    const errorsPresent = errors && Object.keys(errors).some((field) => errors[field] && errors[field].length)

    return (
      <ModalContainer
        visible={this.props.currentModal === "AddFakeProviderAccountModal"}
        onClose={this.handleClose}
        title={false && currentProviderName}
      >
        <ModalBody>
          <h2>Add a new account or new channels to a current account</h2>
          <ButtonGroup>
            {Object.keys(PROVIDERS).filter((providerName) => PROVIDERS[providerName].unsupported).map((provider) => {
              return (
                <Button
                  key={provider}
                  selected={provider === currentProvider}
                  onClick={this.chooseProvider.bind(this, provider)}
                >
                  {<Icon name={provider.toLowerCase()}  className={classes.icon}/>}
                  {PROVIDERS[provider].name}
                </Button>
              )
            })}
          </ButtonGroup>

          {accountsForProvider.length > 0 && <Select
            label="Account"
            className={classes.select}
            options={accountOptions}
            onChange={this.handleChooseAccount}
            currentOption={currentAccount ? this.accountOption(currentAccount) : placeholder}
            name="select-account"
          />}

          {currentAccount === "new" && <div>
            <Input
              value={this.state.userName}
              placeholder={`username for ${PROVIDERS[currentProvider].name}`}
              onChange={this.handleParam.bind(this, "userName")}
              type="text"
              validations={["required"]}
              handleErrors={this.handleInputErrors.bind(this, "userName")}
            />
            <Input
              value={this.state.email}
              placeholder={`email (optional)`}
              onChange={this.handleParam.bind(this, "email")}
              type="email"
            />
            <Input
              value={this.state.photoUrl}
              placeholder={`Profile picture url (optional)`}
              onChange={this.handleParam.bind(this, "photoUrl")}
              type="text"
            />
          </div>}

          {currentProvider &&
            <Form onSubmit={this.submit}>
              {currentProvider === "TWITTER" ? (
                <p>All channels available by default for Twitter</p>
              ) : (
                <div>
                  <h3>Choose Channels to add:</h3>
                  <Flexbox justify="center">
                    {Object.keys(PROVIDERS[currentProvider].channelTypes).map((channelType) => {
                      const selected = this.state.channelTypes.includes(channelType)
                      const hasMultiple = Helpers.channelTypeHasMultiple(null, currentProvider, channelType)
                      const hasForums = Helpers.channelTypeHasForums(null, currentProvider, channelType)

                      return <div key={channelType}>
                        <Button
                          style="inverted"
                          onClick={this.chooseChannel.bind(this, channelType)}
                          selected={selected}
                        >
                          {channelType.titleCase()}
                        </Button>

                        {selected && hasForums && <Input
                          value={this.state[`${channelType}-forumName`] || ""}
                          placeholder={`${PROVIDERS[currentProvider].forums.name} name`}
                          onChange={this.handleParam.bind(this, `${channelType}-forumName`)}
                          type="text"
                          validations={["required"]}
                          handleErrors={this.handleInputErrors.bind(this, `${channelType}-forumName`)}
                        />}

                        {selected && hasMultiple && <Input
                          value={this.state[`${channelType}-channelName`] || ""}
                          placeholder="Channel Name"
                          onChange={this.handleParam.bind(this, `${channelType}-channelName`)}
                          type="text"
                          validations={["required"]}
                          handleErrors={this.handleInputErrors.bind(this, `${channelType}-channelName`)}
                        />}

                      </div>
                    })}
                  </Flexbox>
                </div>
              )}

              <Button
                type='submit'
                pending={this.state.pending}
                disabled={errorsPresent}
              >
                Add {PROVIDERS[currentProvider].name} Account
              </Button>

              <hr/>
              <div className={classes.instructions}>
                <div>
                  <strong>Instructions:</strong>
                </div>
              </div>

              <h2>Have a platform you want to share to that's not on this list? Let us know and we'll add it!</h2>
            </Form>
          }
        </ModalBody>
      </ModalContainer>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: (payload) => dispatch({type: CLOSE_MODAL, payload}),
    addFakeAccountRequest: (payload, cb, onFailure) => dispatch({type: CREATE_FAKE_ACCOUNT_REQUEST, payload, cb, onFailure}),
    addFakeChannelRequest: (payload, cb, onFailure) => dispatch({type: CREATE_FAKE_CHANNEL_REQUEST, payload, cb, onFailure}),
  }
}
const mapStateToProps = (state) => {
  return {
    currentModal: state.viewSettings.currentModal,
    options: state.viewSettings.modalOptions || {},
    providerAccounts: state.providerAccounts,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddFakeProviderAccount)
