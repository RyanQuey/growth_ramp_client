import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon, Card } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { TestResult } from 'user/components/partials'
import { SET_CURRENT_POST_TEMPLATE, SET_CURRENT_POST, SET_CURRENT_MODAL, UPDATE_PLAN_REQUEST  } from 'constants/actionTypes'
import { AUDIT_TESTS } from 'constants/auditTests'
import {UTM_TYPES} from 'constants/posts'
import {formActions} from 'shared/actions'
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
    const {currentAudit, auditLists, auditListItems, user} = this.props
    if (
      !currentAudit.id || currentAudit.err
    ) return null

    const currentAuditLists = auditLists[currentAudit.id]

    // check if they picked an audit, but haven't finished loading those lists yet
    if (
      !currentAuditLists
    ) return <Icon name="spinner"/>

    return (
      <div className={`${classes.container} ${this.props.hidden ? classes.hidden : ""}`}>

        <h2>Audit Results</h2>

        <Flexbox className={classes.table} direction="column" align="center">
          {false && <Flexbox className={` ${classes.tableHeader}`} direction="row">
            <div className={`${classes.columnOne}`}></div>
            <div className={`${classes.columnTwo}`}></div>
            <div className={`${classes.columnThree}`}></div>
            <div className={`${classes.columnFour}`}></div>
            <div className={`${classes.columnFive}`}></div>
          </Flexbox>}

          {Object.keys(AUDIT_TESTS).map((testKey, index) => {
            let alternatingClass = (index % 2) == 1 ? "oddRow" : "evenRow"
            const testMetadata = AUDIT_TESTS[testKey]

            const testListsIds = Object.keys(currentAuditLists).filter((listId) => currentAuditLists[listId].testKey === testKey)
            const testListsArr = testListsIds.map((listId) => currentAuditLists[listId])

            if (
              !testListsArr
            ) return <Icon name="spinner"/>


            let totalItemsInTestCount = 0
            let fixedItemsInTestCount = 0
            testListsArr && testListsArr.forEach((list) => {
              if (auditListItems[list.id]) {
                let itemsForList = Object.keys(auditListItems[list.id]).map((itemId) => auditListItems[list.id][itemId])

                totalItemsInTestCount += itemsForList.length
                fixedItemsInTestCount += itemsForList.filter((item) => item.fixed).length
              }
            })

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
                  <div className={` ${classes.header}`}>
                    <Icon name={this.state[testKey] === "open" ? "angle-down" : "angle-right"} />&nbsp;
                    <Icon name={testKey.toLowerCase()} />&nbsp;
                    {testMetadata.question}&nbsp;
                    <span className={classes.previewText}>({testListsArr.length ? `${fixedItemsInTestCount}/${totalItemsInTestCount}` : "test coming soon"})</span>
                  </div>

                </Flexbox>

                {this.state[testKey] === "open" &&
                  <Flexbox className={`${classes.lists} ${classes.row}`} direction="column" align="center" flexWrap="wrap" justify="space-between">
                    <TestResult
                      testKey={testKey}
                      testListsArr={testListsArr}
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

