import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import {
  CLOSE_MODAL,
  SET_CURRENT_MODAL,
  GET_GA_GOALS_REQUEST,
  UPDATE_WEBSITE_REQUEST,
  CREATE_CUSTOM_LIST_REQUEST,
  FETCH_CUSTOM_LIST_REQUEST,
} from 'constants/actionTypes'
import { Button, Form, Card, Flexbox, Icon } from 'shared/components/elements'
import { ConfirmationPopup, Popup } from 'shared/components/groups'
import { AccountSubscription } from 'shared/components/partials'
import { CustomListForm} from 'user/components/partials'
import { ButtonGroup } from 'shared/components/groups'
import { PROVIDERS } from 'constants/providers'
import { formActions, alertActions } from 'shared/actions'
import classes from './style.scss'

class WebsiteSettingsModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pending: false,
      removingWebsite: false,
    }

    this.onSuccess = this.onSuccess.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.togglePending = this.togglePending.bind(this)
    this.removeSite = this.removeSite.bind(this)
    this.handleCreatedList = this.handleCreatedList.bind(this)
    this.toggleCreatingCustomList = this.toggleCreatingCustomList.bind(this)
    this.toggleRemovingSite = this.toggleRemovingSite.bind(this)
    this.closeForm = this.closeForm.bind(this)
  }

  componentWillReceiveProps(props) {
    const {website, goals} = props

    if (!_.isEqual(website, this.props.website)) {
      const {gaWebPropertyId, googleAccountId, externalGaAccountId} = website
      this.props.getGoals({gaWebPropertyId, googleAccountId, externalGaAccountId, websiteId: website.id}) //only be websiteId for now. can manually sort by profile or webproperty in frontend later too
      this.props.fetchCustomLists({websiteId: website.id})
    }
  }

  handleClose (){
    this.toggleCreatingCustomList(false)
    this.toggleEditingCustomList(false)
    this.props.closeModal()
  }

  // close the custom list form
  closeForm () {
    this.toggleCreatingCustomList(false)
    this.toggleEditingCustomList(false)
  }

  onSuccess () {
    this.handleClose();

    if (typeof this.props.onSuccess === 'function') {
      this.props.onSuccess();
    }
  }
  togglePending(value = !this.state.pending) {
    this.setState({pending: value})
  }

  toggleInfoPopup (value = !this.state.infoIsOpen) {
    this.setState({infoIsOpen: value})
  }

  toggleRemovingSite (value = !this.state.removingWebsite) {
    this.setState({removingWebsite: value})
  }

  toggleCreatingCustomList (value = !this.state.creatingCustomList) {
    this.setState({creatingCustomList: value})
  }

  toggleEditingCustomList (customList = false) {
    if (customList) {
      formActions.setParams("CustomList", "data", customList)
    } else {
      formActions.clearParams("CustomList", "data")
    }

    this.setState({editingCustomList: customList})
  }

  removeSite (website) {
    this.setState({deletePending: true})

    const cb = () => {
      this.setState({deletePending: false, removingWebsite: false})

      this.handleClose()
    }

    const onFailure = (err) => {
      this.setState({deletePending: false})
      alertActions.newAlert({
        title: "Failure to remove website: ",
        level: "DANGER",
        message: err.message || "Unknown error",
        options: {timer: false},
      })
    }

    const params = {id: website.id, status: "ARCHIVED", userId: website.userId}

    this.props.updateWebsite(params, cb, onFailure)
  }

  handleCreatedList () {
    this.toggleCreatingCustomList(false)
    this.toggleEditingCustomList(false)

    alertActions.newAlert({
      title: "Success!",
      level: "SUCCESS",
    })
  }

  render (){
    const {website, siteGoals, customLists} = this.props
    const {editingCustomList, creatingCustomList, infoIsOpen} = this.state

    const customListsArr = Object.keys(customLists).map((id) => customLists[id]).filter((list) => list.websiteId === website.id)

    const formIsOpen = editingCustomList || creatingCustomList
    const visible = this.props.currentModal === "WebsiteSettingsModal"

    if (!visible || !website) {
      return null
    }

    return (
      <div className={classes.modal}>
        <ModalContainer
          visible={visible}
          onClose={this.handleClose}
          title={website.name}
        >
          <ModalBody>
            {!formIsOpen ? (
              <div className={classes.formSection}>
                <h2>
                  Custom Lists
                  <div className={classes.popupWrapper}>
                    <Icon name="info-circle" className={classes.helpBtn} onClick={this.toggleInfoPopup.bind(this, !infoIsOpen)}/>
                    <Popup
                      side="bottom"
                      float="center"
                      handleClickOutside={this.toggleInfoPopup.bind(this, false)}
                      show={infoIsOpen}
                      containerClass={classes.popupContainer}
                    >
                      <div className={classes.helpBox}>
                        <div className={classes.description}>
                          <div className={classes.title}></div>
                          <div>Create criteria for a custom list that will be part of your next audit</div>
                        </div>
                      </div>
                    </Popup>
                  </div>
                </h2>
                {!customListsArr.length ? (
                  <div>Click below to make a custom list for your future audits</div>
                ) : (
                  customListsArr.map((customList) =>
                    <Flexbox justify="space-between" key={customList.id} className={`${classes.customListRow}`}>
                      <div className={classes.settingLabel}>
                        <div className={classes.main}>{customList.name}</div>
                        &nbsp;
                      </div>

                      <div className={classes.settingValue}>
                        <Icon name="gear" onClick={this.toggleEditingCustomList.bind(this, customList)}/>
                      </div>
                    </Flexbox>
                  )
                )}

                <Button className={classes.createBtn}onClick={this.toggleCreatingCustomList.bind(this, true)} name="plus-square" small={true}><Icon name="plus-circle" />&nbsp;Create Custom List</Button>
              </div>
            ) : (
              <CustomListForm
                website={website}
                onSuccess={this.handleCreatedList}
                onCancel={this.closeForm}
              />
            )}

            <Flexbox justify="flex-end">
              <div>
                {false && <Button>Save Settings</Button>}
              </div>

              <div className={`${classes.popupWrapper} ${classes.removeBtn}`}>
                {!formIsOpen && <Button style="danger" onClick={this.toggleRemovingSite} small={true}>Remove Site</Button>}
                <ConfirmationPopup
                  show={this.state.removingWebsite}
                  handleClickOutside={this.toggleRemovingSite.bind(this, false)}
                  onConfirm={this.removeSite.bind(this, website)}
                  onCancel={this.toggleRemovingSite.bind(this, false)}
                  pending={this.state.deletePending}
                  dangerous={true}
                  side="top"
                />
              </div>
            </Flexbox>
          </ModalBody>
        </ModalContainer>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: (payload) => dispatch({type: CLOSE_MODAL, payload}),
    getCustomLists: (payload, cb, onFailure) => dispatch({
      type: FETCH_CUSTOM_LISTS_REQUEST,
      payload,
      cb,
      onFailure,
    }),
    getGoals: (payload, cb, onFailure) => dispatch({
      type: GET_GA_GOALS_REQUEST,
      payload,
      cb,
      onFailure,
    }),
    fetchCustomLists: (payload, cb, onFailure) => dispatch({type: FETCH_CUSTOM_LIST_REQUEST, payload, cb, onFailure}),
    createCustomList: (payload, cb, onFailure) => dispatch({type: CREATE_CUSTOM_LIST_REQUEST, payload, cb, onFailure}),
    setCurrentCustomList: (payload) => dispatch({type: SET_CURRENT_CUSTOM_LIST, payload}),
    updateWebsite: (payload, cb, onFailure) => dispatch({type: UPDATE_WEBSITE_REQUEST, payload, cb, onFailure}),
  }
}
const mapStateToProps = (state) => {
  const currentWebsite = Helpers.safeDataPath(state.viewSettings, "modalOptions.website")
  return {
    currentModal: state.viewSettings.currentModal,
    options: state.viewSettings.modalOptions || {},
    website: currentWebsite,
    goals: state.goals,
    siteGoals: currentWebsite && Helpers.safeDataPath(state, `goals.${currentWebsite.id}.items`, []),
    customLists: state.customLists,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WebsiteSettingsModal)
