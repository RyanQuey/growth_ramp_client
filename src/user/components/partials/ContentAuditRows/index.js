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
class ContentAuditRows extends Component {
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
    const {currentAudit, previousAudit, currentAuditSection, auditLists, auditListItems, user, ifAllEmptyComponent = "", showDifficultyFlags} = this.props
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

    let undisplayedTests = 0

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

            let results = this.props.testFilterFunc({testKey, testListsArr, previousAuditTestListsArr, currentAudit, auditListItems})
            if (results === null) {
              // this is how to signal that we're not showing this row at all
              undisplayedTests ++
              return null
            }

            const {itemsToShowByList, completedItemsInTest, totalItemsInTest} = results

            const summaryText = this.props.getSummaryText({completedItemsInTest, totalItemsInTest})


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
                      {showDifficultyFlags && completedItemsInTest.length === totalItemsInTest.length && (
                          <Flag background="green"><Icon name="check"/></Flag>
                      )}

                      {showDifficultyFlags && completedItemsInTest.length !== totalItemsInTest.length && (
                         <span>
                          {difficultyFlag === "easy" && <Flag background="#86c286">Easy</Flag>}
                          {difficultyFlag === "hard" && <Flag background="#7f7fca">Hard</Flag>}
                        </span>
                      )}
                    </div>
                  </div>
                </Flexbox>

                {this.state[testKey] === "open" &&
                  <Flexbox className={`${classes.lists} ${classes.row}`} direction="column" align="center" flexWrap="wrap" justify="space-between">
                    <TestResult
                      testKey={testKey}
                      listsArr={currentAuditSection === "currentIssues" ? testListsArr : previousAuditTestListsArr}
                      customListsArr={currentAuditSection === "currentIssues" ? testListsArr : previousAuditTestListsArr}
                      itemsToShowByList={itemsToShowByList}
                    />
                  </Flexbox>
                }
              </Flexbox>
            )
          })}

          {undisplayedTests === Object.keys(AUDIT_TESTS).length && ifAllEmptyComponent}
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

const ConnectedContentAuditRows = connect(mapStateToProps, mapDispatchToProps)(ContentAuditRows)
export default ConnectedContentAuditRows

