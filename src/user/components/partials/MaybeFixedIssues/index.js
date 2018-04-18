import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon, Card, Flag } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { TestResult, ContentAuditRows } from 'user/components/partials'
import { SET_CURRENT_POST_TEMPLATE, SET_CURRENT_POST, SET_CURRENT_MODAL, UPDATE_PLAN_REQUEST  } from 'constants/actionTypes'
import { AUDIT_TESTS, AUDIT_TEST_FLAGS, } from 'constants/auditTests'
import {UTM_TYPES} from 'constants/posts'
import {formActions} from 'shared/actions'
import theme from 'theme'
import classes from './style.scss'

class MaybeFixedIssues extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.toggleOpen = this.toggleOpen.bind(this)
  }

  toggleOpen (testKey, value, e) {
    this.setState({[testKey]: value})
  }

  // marked as complete, but less than two weeks ago, and not fixed, so who knows. Will find out in a couple months :)
  getCompletedAndMaybeFixedIssues ({testKey, testListsArr, previousAuditTestListsArr, auditListItems, currentAudit}) {
    const testMetadata = AUDIT_TESTS[testKey]
    let totalItemsInTest = []
    let completedItemsInTest = []
    let itemsToShowByList = {}
    let twoWeeksBeforeCurrentAudit = moment(currentAudit.createdAt).subtract(2, "weeks")

    previousAuditTestListsArr.forEach((list) => {
      /* TODO really what we should do is, in the audit, only get 404s that happened since the date previous audit marked it as completed. Otherwise, really could by maybe fixed
      if (["brokenInternal", "brokenExternal"].includes(list.listKey)) {
        //any times this shows up, even if recent, means it's still broken. Returning empty array
        itemsToShowByList[list.id] = []
        return
      }*/

      let correspondingList = testListsArr.find((l) => l.listKey === list.listKey)
      // unless we changed what lists we return OR they added a custom list since last time and didn't refresh the old audit, there should be a corresponding list.
      // currently: just don't show that previous list!
      if (!correspondingList) {return}

      let correspondingListItems = auditListItems[correspondingList.id]
      let correspondingListItemsArr = Object.keys(correspondingListItems).map((id) => correspondingListItems[id])

      let itemsForList = Object.keys(auditListItems[list.id])
      .map((itemId) => auditListItems[list.id][itemId])
      .filter((item) => {
        let matchInCurrentAudit = correspondingListItemsArr.find((i) => i.dimension === item.dimension)

        return matchInCurrentAudit && item.completed && twoWeeksBeforeCurrentAudit.isBefore(item.completedAt)
      })

      totalItemsInTest = totalItemsInTest.concat(itemsForList)

      itemsToShowByList[list.id] = itemsForList
    })

    // don't need to show it if there's nothing
    if (!totalItemsInTest.length) {
      return null
    }

    return {itemsToShowByList, completedItemsInTest, totalItemsInTest}
  }

  // marked as complete, but less than two weeks ago, and not fixed, so who knows. Will find out in a couple months :)
  getIncompleteButMaybeFixedIssues ({testKey, testListsArr, previousAuditTestListsArr, auditListItems, currentAudit}) {
    const testMetadata = AUDIT_TESTS[testKey]
    let totalItemsInTest = []
    let completedItemsInTest = []
    let itemsToShowByList = {}
    let twoWeeksBeforeCurrentAudit = moment(currentAudit.createdAt).subtract(2, "weeks")

    previousAuditTestListsArr.forEach((list) => {
      /* TODO really what we should do is, in the audit, only get 404s that happened since the date previous audit marked it as completed. Otherwise, really could by maybe fixed
      if (["brokenInternal", "brokenExternal"].includes(list.listKey)) {
        //any times this shows up, even if recent, means it's still broken. Returning empty array
        itemsToShowByList[list.id] = []
        return
      }*/

      let correspondingList = testListsArr.find((l) => l.listKey === list.listKey)
      // unless we changed what lists we return OR they added a custom list since last time and didn't refresh the old audit, there should be a corresponding list.
      // currently: just don't show that previous list!
      if (!correspondingList) {return}

      let correspondingListItems = auditListItems[correspondingList.id]
      let correspondingListItemsArr = Object.keys(correspondingListItems).map((id) => correspondingListItems[id])

      let itemsForList = Object.keys(auditListItems[list.id])
      .map((itemId) => auditListItems[list.id][itemId])
      .filter((item) => {
        let matchInCurrentAudit = correspondingListItemsArr.find((i) => i.dimension === item.dimension)

        return !matchInCurrentAudit && !item.completed
      })

      totalItemsInTest = totalItemsInTest.concat(itemsForList)

      itemsToShowByList[list.id] = itemsForList
    })

    // don't need to show it if there's nothing
    if (!totalItemsInTest.length) {
      return null
    }

    return {itemsToShowByList, completedItemsInTest, totalItemsInTest}
  }

  getSummaryText ({completedItemsInTest, totalItemsInTest}) {
    return `(${totalItemsInTest.length})`
  }

  render() {
    const {currentAudit, previousAudit, currentAuditSection, auditLists, auditListItems, user} = this.props

    if (
      !currentAudit.id || currentAudit.err
    ) return null

    if (!previousAudit.id) return (
      <div>
        <h3 style={{"margin-top": "0"}}>Nothing to show yet!</h3>
        <div>Once you receive your second audit, we'll display what issues might have been resolved since your previous audit, but require more information for us to be sure. This will help you prevent any issues from falling between the cracks.</div>
      </div>
    )

    const currentAuditLists = auditLists[currentAudit.id]
    const previousAuditLists = auditLists[previousAudit.id]

    // check if they picked an audit, but haven't finished loading those lists yet
    if (
      !currentAuditLists ||
      !previousAuditLists
    ) return <Icon name="spinner"/>

    return (
      <div className={`${classes.container} ${this.props.hidden ? classes.hidden : ""}`}>
        <Flexbox className={classes.table} direction="column" align="center">

          { /* // marked as completed in previous audit, and still shows up in currentAudit, but was only marked complete within last couple weeks */ }
          <h3>Did not appear in current audit, but never marked as complete</h3>
          <ContentAuditRows
            testFilterFunc={this.getIncompleteButMaybeFixedIssues}
            getSummaryText={this.getSummaryText}
            ifAllEmptyComponent="Nothing to show!"
          />
          <h3>Appeared in current audit, but only recently marked as complete</h3>
          <ContentAuditRows
            testFilterFunc={this.getCompletedAndMaybeFixedIssues}
            getSummaryText={this.getSummaryText}
            ifAllEmptyComponent="Nothing to show!"
          />
        </Flexbox>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    //really is campaign posts params
    audit: state.audit,
    user: state.user,
    currentPost: state.currentPost,
    currentAudit: state.currentAudit,
    previousAudit: state.previousAudit,
    currentAuditSection: state.currentAuditSection,
    auditLists: state.auditLists,
    auditListItems: state.auditListItems,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    setCurrentPost: (payload, items, options) => {
      let type = items === "posts" ? SET_CURRENT_POST : SET_CURRENT_POST_TEMPLATE
      dispatch({type, payload, options})

    },
  }
}

const ConnectedMaybeFixedIssues = connect(mapStateToProps, mapDispatchToProps)(MaybeFixedIssues)
export default ConnectedMaybeFixedIssues

