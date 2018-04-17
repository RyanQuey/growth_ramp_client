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

class FixedIssues extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.toggleOpen = this.toggleOpen.bind(this)
  }

  toggleOpen (testKey, value, e) {
    this.setState({[testKey]: value})
  }

  getFixedIssues ({testKey, testListsArr, previousAuditTestListsArr, auditListItems, currentAudit}) {
    const testMetadata = AUDIT_TESTS[testKey]
    let totalItemsInTest = []
    let completedItemsInTest = []
    let itemsToShowByList = {}
    let twoWeeksBeforeCurrentAudit = moment(currentAudit.createdAt).subtract(2, "weeks")

    previousAuditTestListsArr.forEach((list) => {
      let correspondingList = testListsArr.find((l) => l.listKey === list.listKey)
      let correspondingListItems = auditListItems[correspondingList.id]
      let correspondingListItemsArr = Object.keys(correspondingListItems).map((id) => correspondingListItems[id])

      let itemsForList = Object.keys(auditListItems[list.id])
      .map((itemId) => auditListItems[list.id][itemId])
      .filter((item) => {
        let matchInCurrentAudit = correspondingListItemsArr.find((i) => i.dimension === item.dimension)

        return !matchInCurrentAudit
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
        <div>Once you receive your second audit, we'll display what issues you successfully solved from your previous audit.</div>
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
          <ContentAuditRows
            testFilterFunc={this.getFixedIssues}
            getSummaryText={this.getSummaryText}
            ifAllEmptyComponent="Nothing has been successfully fixed since last audit"
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

const ConnectedFixedIssues = connect(mapStateToProps, mapDispatchToProps)(FixedIssues)
export default ConnectedFixedIssues

