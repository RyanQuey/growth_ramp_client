import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon, Card, Flag } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { TestResult } from 'user/components/partials'
import { SET_CURRENT_POST_TEMPLATE, SET_CURRENT_POST, SET_CURRENT_MODAL, UPDATE_PLAN_REQUEST  } from 'constants/actionTypes'
import { AUDIT_TESTS, AUDIT_TEST_FLAGS, } from 'constants/auditTests'
import {UTM_TYPES} from 'constants/posts'
import {formActions} from 'shared/actions'
import theme from 'theme'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in Compose only
class ContentAuditTable extends Component {
  constructor() {
    super()

    this.state = {
    }

    this.toggleOpen = this.toggleOpen.bind(this)
  }

  toggleOpen (testKey, value, e) {
    this.setState({[testKey]: value})
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
      (["fixed", "maybeFixed"].includes(currentAuditSection) && !previousAuditLists)
    ) return <Icon name="spinner"/>

    return (
      <div className={`${classes.container} ${this.props.hidden ? classes.hidden : ""}`}>


        <Flexbox className={classes.table} direction="column" align="center">
          {Object.keys(AUDIT_TESTS).map((testKey, index) => {
            let alternatingClass = (index % 2) == 1 ? "oddRow" : "evenRow"
            const testMetadata = AUDIT_TESTS[testKey]

            const testListsIds = Object.keys(currentAuditLists).filter((listId) => currentAuditLists[listId].testKey === testKey)
            const testListsArr = testListsIds.map((listId) => currentAuditLists[listId])

            const previousAuditTestListsIds = previousAuditLists && Object.keys(previousAuditLists).filter((listId) => previousAuditLists[listId].testKey === testKey)
            const previousAuditTestListsArr = previousAuditTestListsIds && previousAuditTestListsIds.map((listId) => previousAuditLists[listId])

            if (
              !testListsArr
            ) return <Icon name="spinner"/>


            let totalItemsInTest = []
            let completedItemsInTest = []
            let itemsToShowByList = {}
            let twoWeeksBeforeCurrentAudit = moment(currentAudit.createdAt).subtract(2, "weeks")
            let summaryText

//TODO probably want to break these out into separate components...? would be awfully similar though, at least for now
            if (currentAuditSection === "currentIssues") {
              testListsArr.forEach((list) => {
                let itemsForList = Object.keys(auditListItems[list.id]).map((itemId) => auditListItems[list.id][itemId])
                totalItemsInTest = totalItemsInTest.concat(itemsForList)
                let completedItemsForList = itemsForList.filter((item) => item.completed)
                completedItemsInTest = completedItemsInTest.concat(completedItemsForList)

                itemsToShowByList[list.id] = itemsForList
              })

              summaryText = `(${completedItemsInTest.length}/${totalItemsInTest.length})`

            } else if (currentAuditSection === "maybeFixed") {
              // marked as completed in previous audit, and still shows up in currentAudit, but was only marked complete within last couple weeks

              previousAuditTestListsArr.forEach((list) => {
                /* TODO really what we should do is, in the audit, only get 404s that happened since the date previous audit marked it as completed. Otherwise, really could by maybe fixed
                if (["brokenInternal", "brokenExternal"].includes(list.listKey)) {
                  //any times this shows up, even if recent, means it's still broken. Returning empty array
                  itemsToShowByList[list.id] = []
                  return
                }*/

                let correspondingList = testListsArr.find((l) => l.listKey === list.listKey)
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

              summaryText = `(${totalItemsInTest.length})`

            } else if (currentAuditSection === "fixed") {
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

              summaryText = `(${totalItemsInTest.length})`
            }

            const difficultyFlag = AUDIT_TEST_FLAGS[testKey].difficulty

            return (
              <Flexbox
                key={testKey}
                className={`${classes.auditTestContainer} ${classes[alternatingClass]}`}
                direction="column"
              >
                <Flexbox
                  className={`${classes.row} ${classes.topRow}`}
                  direction="row"
                  align="center"
                  justify="space-between"
                  onClick={this.toggleOpen.bind(this, testKey, this.state[testKey] === "open" ? "closed" : "open")}
                >
                  <div className={`${classes.header}`}>
                    <Icon name={this.state[testKey] === "open" ? "angle-down" : "angle-right"} />&nbsp;
                    <Icon name={testKey.toLowerCase()} />&nbsp;
                    {testMetadata.question}&nbsp;
                    <span className={classes.previewText}>{summaryText}</span>
                    <div className={classes.flags}>
                      {currentAuditSection &&
                        completedItemsInTest.length === totalItemsInTest.length ? (
                          <Flag background="green"><Icon name="check"/></Flag>

                        ) : (
                          <span>
                            {difficultyFlag === "easy" && <Flag background="#86c286">Easy</Flag>}
                            {difficultyFlag === "hard" && <Flag background="#7f7fca">Hard</Flag>}
                          </span>

                        )
                      }
                    </div>
                  </div>
                </Flexbox>

                {this.state[testKey] === "open" &&
                  <Flexbox className={`${classes.lists} ${classes.row}`} direction="column" align="center" flexWrap="wrap" justify="space-between">
                    <TestResult
                      testKey={testKey}
                      listsArr={currentAuditSection === "currentIssues" ? testListsArr : previousAuditTestListsArr}
                      itemsToShowByList={itemsToShowByList}
                    />
                  </Flexbox>
                }
              </Flexbox>
            )
          })}
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

const ConnectedContentAuditTable = connect(mapStateToProps, mapDispatchToProps)(ContentAuditTable)
export default ConnectedContentAuditTable

