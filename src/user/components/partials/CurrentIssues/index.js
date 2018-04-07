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

class CurrentIssues extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.toggleOpen = this.toggleOpen.bind(this)
  }

  toggleOpen (testKey, value, e) {
    this.setState({[testKey]: value})
  }

  getCurrentIssues ({testKey, testListsArr, previousAuditTestListsArr, auditListItems, currentAudit}) {
//TODO should only show as current if not in maybe fixed category
    const testMetadata = AUDIT_TESTS[testKey]
    let totalItemsInTest = []
    let completedItemsInTest = []
    let itemsToShowByList = {}
    let twoWeeksBeforeCurrentAudit = moment(currentAudit.createdAt).subtract(2, "weeks")

    testListsArr.forEach((list) => {
      // only including here if not maybe fixed from previous audit
      let previousAuditList = previousAuditTestListsArr && previousAuditTestListsArr.find((l) => l.listKey === list.listKey)
      let previousAuditListItems = previousAuditList && auditListItems[previousAuditList.id]
      let previousAuditListItemsArr = previousAuditListItems && Object.keys(previousAuditListItems).map((id) => previousAuditListItems[id])

      let itemsForList = Object.keys(auditListItems[list.id])
      .map((itemId) => auditListItems[list.id][itemId])
      .filter((item) => {
        let matchInPreviousAudit = previousAuditListItemsArr && previousAuditListItemsArr.find((i) => i.dimension === item.dimension)

        return !matchInPreviousAudit || !matchInPreviousAudit.completed || twoWeeksBeforeCurrentAudit.isBefore(matchInPreviousAudit.completedAt)
      })

      totalItemsInTest = totalItemsInTest.concat(itemsForList)
      let completedItemsForList = itemsForList.filter((item) => item.completed)
      completedItemsInTest = completedItemsInTest.concat(completedItemsForList)

      itemsToShowByList[list.id] = itemsForList
    })

    return {itemsToShowByList, completedItemsInTest, totalItemsInTest}
  }

  getSummaryText ({completedItemsInTest, totalItemsInTest}) {
    return `(${completedItemsInTest.length}/${totalItemsInTest.length})`

  }

  render() {
    const {currentAudit, previousAudit, currentAuditSection, auditLists, auditListItems, user} = this.props
    if (
      !currentAudit.id || currentAudit.err
    ) return null

    const currentAuditLists = auditLists[currentAudit.id]
    const previousAuditLists = auditLists[previousAudit.id]

    // check if they picked an audit, but haven't finished loading those lists yet
    if (
      !currentAuditLists ||
      (previousAudit && !previousAuditLists)
    ) return <Icon name="spinner"/>

    return (
      <div className={`${classes.container} ${this.props.hidden ? classes.hidden : ""}`}>
        <Flexbox className={classes.table} direction="column" align="center">
          <ContentAuditRows
            testFilterFunc={this.getCurrentIssues}
            getSummaryText={this.getSummaryText}
            showDifficultyFlags={true}
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

const ConnectedCurrentIssues = connect(mapStateToProps, mapDispatchToProps)(CurrentIssues)
export default ConnectedCurrentIssues

