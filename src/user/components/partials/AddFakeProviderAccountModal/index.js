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
import { ButtonGroup, Select, Popup } from 'shared/components/groups'
import { PROVIDERS, PROVIDER_SUGGESTION_LIST } from 'constants/providers'
import { errorActions, alertActions } from 'shared/actions'
import classes from './style.scss'

class AddFakeProviderAccount extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pending: false,
      currentProvider: "",
      currentAccount: null,
      email: "",
      userName: "",
      channelType: "",
      forumName: "",
      channelName: "",
      newProvider: "",
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleChooseAccount = this.handleChooseAccount.bind(this)
    this.togglePending = this.togglePending.bind(this)
    this.toggleAddingProvider = this.toggleAddingProvider.bind(this)
    this.chooseProvider = this.chooseProvider.bind(this)
    this.chooseChannelType = this.chooseChannelType.bind(this)
    this.handleParam = this.handleParam.bind(this)
    this.submit = this.submit.bind(this)
    this._createFakeChannel = this._createFakeChannel.bind(this)
    this.handleInputErrors = this.handleInputErrors.bind(this)
    this.checkForRequired = this.checkForRequired.bind(this)
    this.handleProviderText = this.handleProviderText.bind(this)
    this.handleAddProvider = this.handleAddProvider.bind(this)

    this.togglePopup = this.togglePopup.bind(this)
  }
  togglePopup (value) {
    //a string for the popup to use or false for no popup
    this.setState({popup: value})
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

  toggleAddingProvider(value = !this.state.addingProvider) {
    const newState = {
      addingProvider: value,
    }
    //if opening up this form, clear rest of fields
    if (value) {
      Object.assign(newState, {
        currentProvider: "",
        currentAccount: "",
        channelType: "",
      })
    }
    this.setState(newState)
  }

  checkForRequired() {
    let {channelType, currentProvider, currentAccount} = this.state
    // get all the rquired fields
    const requiredFields = currentAccount ? ["channelType"] : ["userName", "channelType"]

/*
    for (let channelType of channelTypes) {
      const hasMultiple = Helpers.channelTypeHasMultiple(null, currentProvider, channelType)

      if (hasMultiple) {
        requiredFields.push(`${channelType}-channelName`)
      }
    }
*/
    // test all
    for (let field of requiredFields) {
console.log(field);
      if (!this.state[field]) {
        return false
      }
    }

    return true
  }

  handleProviderText(value) {
    this.setState({newProvider: value})
  }
  chooseProvider(provider) {
    const newState = {
      currentProvider: provider,
      currentAccount: null,
      channelType: "",
    }

    const accountsForProvider = this.props.providerAccounts[provider]
    newState.currentAccount = accountsForProvider ? null : "new"
    this.setState(newState)
  }

  //if choose from the select bar (ie while adding nwe provider)
  handleAddProvider() {
    const value = this.state.newProvider
    const match = PROVIDER_SUGGESTION_LIST.find((suggestion) => suggestion.toLowerCase() === value.toLowerCase())
    const newState = {addingProvider: false}

    let providerName
    // if already in suggestion list, use that list item
    if (match) {
      //check if we support the provider; if so use that providerName, if not, use match name
      const alreadyAdded = Object.keys(this.props.providerAccounts).find((provider) => provider.toLowerCase() === value.toLowerCase())
      if (alreadyAdded) {
        providerName = alreadyAdded
      } else {
        providerName = match
      }
console.log(value.toLowerCase(), providerName, alreadyAdded);
      newState.brandNewProvider = false

    } else {
      newState.brandNewProvider = true
      providerName = value
    }

    this.setState(newState)
    this.chooseProvider(providerName)
  }

  chooseChannelType(channelType) {
    this.setState({channelType})
  }

  accountOption(account) {
    return {
      label: `${account.userName || "no username"} (${account.email || "no email"})`,
      value: account,
    }
  }

  providerOption(provider) {
    return {
      label: provider,
      value: provider,
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

    const {currentProvider, currentAccount, userName, email, channelType} = this.state

    const cb = (fakeAcct) => {
      const newChannelNames = Object.keys(this.state).filter((stateProp) => stateProp.includes("-name"))

      const promises = []

      // create a new channel for each one specified
      /*
      for (let channelType of channelTypes) {
        const channelParams = {
          userId: store.getState().user.id,
          provider: currentProvider,
          name: this.state[`channelName`],
          providerAccountId: fakeAcct.id,
          unsupportedChannel: true,
          forumName: this.state[`forumName`],
          type: channelType,
        }
        promises.push(this._createFakeChannel(channelParams))
      }*/

      const channelParams = {
        userId: store.getState().user.id,
        provider: currentProvider,
        name: this.state[`channelName`],
        providerAccountId: fakeAcct.id,
        unsupportedChannel: true,
        //forumName: this.state[`forumName`],
        type: channelType,
      }

      promises.push(this._createFakeChannel(channelParams))


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
    const {currentProvider, currentAccount, errors, addingProvider, channelName, channelType, forumName, brandNewProvider} = this.state
    const currentProviderName = Helpers.providerFriendlyName(currentProvider)

    const accountsForProvider = this.props.providerAccounts[currentProvider] || []
    const accountOptions = accountsForProvider.map((a) => (
      this.accountOption(a)
    ))

    accountOptions.unshift({label: "Create New Account", value: "new"})

    const placeholder = {label: "select", value: null}

    const errorsPresent = errors && Object.keys(errors).some((field) => errors[field] && errors[field].length)

    const currentProviders = Object.keys(this.props.providerAccounts)
    const platformOptions = PROVIDER_SUGGESTION_LIST.map((p) => this.providerOption(p))

    // TODO sep component for these buttons
    // cannot map out in the return value because of how children props and ButtonGroup compnoent work, (the plus button ends up messing things up). So define here before returning
    const platformBtns = currentProviders.map((provider) => {
      return (
        <Button
          key={provider}
          selected={provider === currentProvider}
          onClick={this.chooseProvider.bind(this, provider)}
        >
          <Icon name={provider.toLowerCase()}  className={classes.icon}/>
          {Helpers.providerFriendlyName(provider)}
        </Button>
      )
    })

    if (brandNewProvider) {
      //add a temp button for them too
      platformBtns.push(
        <Button
          key={currentProvider}
          selected={true}
        >
          <Icon name={currentProvider.toLowerCase()}  className={classes.icon}/>
          {currentProvider}
        </Button>
      )
    }

    platformBtns.push(
      <Button
        style="inverted"
        onClick={this.toggleAddingProvider}
        key="new"
      >
        <Icon name="plus"  className={classes.icon}/>
      </Button>
    )

    return (
      <ModalContainer
        visible={this.props.currentModal === "AddFakeProviderAccountModal"}
        onClose={this.handleClose}
        title={false && currentProviderName}
      >
        <ModalBody>
          <h2>Add channel Growth Ramp does not post to</h2>
          <div>Growth Ramp currently only makes posts to Facebook, LinkedIn, and Twitter. To make a post to a different platform, or to a channel in Facebook, LinkedIn or Twitter that we do not support yet, add a channel below. Growth Ramp will not publish the post, but will generate a short link (with its utms).</div>
          <ButtonGroup>
            {platformBtns}
          </ButtonGroup>

          {addingProvider && (
            <form onSubmit={this.handleAddProvider}>
              <Input
                label={`Add new platform`}
                onChange={this.handleProviderText}
              />
              <Button
                type="submit"
                pending={this.state.pending}
                disabled={!this.state.newProvider}
              >
                Add Platform
              </Button>
            </form>
          )}


          {accountsForProvider.length > 0 && <Select
            label={`${currentProviderName} Account`}
            className={classes.select}
            options={accountOptions}
            onChange={this.handleChooseAccount}
            currentOption={currentAccount ? this.accountOption(currentAccount) : placeholder}
            name="select-account"
          />}

          {currentAccount === "new" && <div>
            <Input
              value={this.state.userName}
              placeholder={`username for ${currentProviderName}`}
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
          </div>}

            <Form onSubmit={this.submit}>
              {currentProvider && currentAccount &&
                <div>
                  <h3>Channel Details:</h3>
                  <Flexbox justify="center" direction="column">
                    <Flexbox justify="center" direction="row">
                      <Input
                        className={classes.input}
                        value={channelType}
                        placeholder="Channel Type"
                        onChange={this.handleParam.bind(this, `channelType`)}
                        type="text"
                        validations={["required"]}
                        handleErrors={this.handleInputErrors.bind(this, `channelType`)}
                      />

                      <div className={classes.popupWrapper}>
                        <Icon name="question-circle" className={classes.helpBtn} onClick={this.togglePopup.bind(this, "channelType")}/>
                        <Popup
                          side="top"
                          float="center"
                          handleClickOutside={this.togglePopup.bind(this, false)}
                          show={this.state.popup === "channelType"}
                          containerClass={classes.popupContainer}
                        >
                          <div className={classes.helpBox}>
                            <div className={classes.instructions}>
                              <div>Growth Ramp recommends using the channel type for the source UTM. For example, if you're promoting in a Facebook Group called "Sofas are soft" your source UTM is "Facebook-Group". (Beware that utms are case sensitive). <br/>Fill in your channel type here to use it when creating links for this channel.</div>
                            </div>
                          </div>
                        </Popup>
                      </div>

                      {false && <Input
                        value={forumName}
                        placeholder={`Forum name (optional)`}
                        onChange={this.handleParam.bind(this, `forumName`)}
                        type="text"
                        handleErrors={this.handleInputErrors.bind(this, `forumName`)}
                      />}
                    </Flexbox>

                    <Flexbox justify="center" direction="row">
                      <Input
                        value={channelName}
                        placeholder="Channel Name"
                        className={classes.input}
                        onChange={this.handleParam.bind(this, `channelName`)}
                        validations={["required"]}
                        type="text"
                        handleErrors={this.handleInputErrors.bind(this, `channelName`)}
                      />
                      <div className={classes.popupWrapper}>
                        <Icon name="question-circle" className={classes.helpBtn} onClick={this.togglePopup.bind(this, "channelName")}/>
                        <Popup
                          side="top"
                          float="center"
                          handleClickOutside={this.togglePopup.bind(this, false)}
                          show={this.state.popup === "channelName"}
                          containerClass={classes.popupContainer}
                        >
                          <div className={classes.helpBox}>
                            <div className={classes.instructions}>
                              <div>Growth Ramp recommends using the channel name for the medium UTM. For example, if you're promoting in a Facebook Group called "Sofas are soft" your medium UTM is "Sofas-are-soft". (Beware that utms are case sensitive). <br/>Fill in your channel name here to use it when creating links for this channel</div>
                            </div>
                          </div>
                        </Popup>
                      </div>
                    </Flexbox>
                  </Flexbox>
                </div>
              }

            <Button
              type='submit'
              pending={this.state.pending}
              title={(errorsPresent || !currentProvider || !currentAccount || !channelType || !channelName) ? "Please fill out all required fields" : ""}
              disabled={errorsPresent || !currentProvider || !currentAccount || !channelType || !channelName}
            >
              Add {currentProviderName || ""} Account
              </Button>
          </Form>
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
