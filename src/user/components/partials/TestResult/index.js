import { Component } from 'react';
import { connect } from 'react-redux'
import {
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form, Checkbox } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { AuditListItemRow } from 'user/components/groups'
import { AUDIT_TESTS,  } from 'constants/auditTests'
import {DIMENSIONS_METRICS_FRIENDLY_NAME, METRICS_WITH_AVERAGES, } from 'constants/analytics'
import {formActions, alertActions} from 'shared/actions'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'

class TestResult extends Component {
  constructor() {
    super()

    this.state = {
    }

  }

  render () {
    const { listsArr, testKey, auditListItems, itemsToShowByList, user, currentAuditSection, currentAudit, previousAudit } = this.props
    const testListTypes = AUDIT_TESTS[testKey].lists
    const auditToCheck = currentAuditSection === "currentIssues" ? currentAudit : previousAudit

    return (
      <div className={classes.testResult}>
        {Object.keys(testListTypes).map((listKey, index) => {
          let listMetadata = testListTypes[listKey]
          const list = listsArr.find((list) => list.listKey === listKey)
          const listItemsArr = itemsToShowByList[list.id].filter((item) =>
            // filter out completed issues if that setting is set
            currentAuditSection !== "currentIssues" ||
            !user.settings || !user.settings.hideCompletedAuditItems ||
            !item.completed
          )

          const totals = list.summaryData.totals

          return <Flexbox key={listKey} className={`${classes.table}`} direction="column">
            <h3>{listMetadata.header}</h3>
            {!listItemsArr.length ? (
              <div>Well done, nothing needs improvement right now!</div>
            ) : (
              <table>
                <tr className={`${classes.tableHeader}`}>
                  <th className={`${classes[`column0`]}`}>Done</th>
                  <th className={`${classes[`column1`]}`}>Issue</th>
                  {Object.keys(listMetadata.metrics).map((metricName, index) =>
                    <th key={metricName} className={`${classes[`column${index +2}`]}`}>{DIMENSIONS_METRICS_FRIENDLY_NAME[metricName]}</th>
                  )}
                </tr>

                <tr
                  className={`${classes.tableRow} ${classes.oddRow} ${classes.totalsRow}`}
                >
                  <td className={`${classes[`column0`]}`}></td>
                  <td className={`${classes[`column1`]}`}></td>

                  {Object.keys(listMetadata.metrics).map((metricName, index) => {
                    const value = totals[metricName]
                    const totalType = METRICS_WITH_AVERAGES.includes(metricName) ? "average" : "total"

                    return <td key={metricName} className={`${classes[`column${index +2}`]}`}>{value} ({totalType})</td>
                  })}
                </tr>

                {listItemsArr.map((item) => {
                  return <AuditListItemRow
                    key={item.id}
                    item={item}
                    listMetadata={listMetadata}
                  />
                })}
              </table>
            )}

          </Flexbox>
        })}


      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const mapStateToProps = state => {
  return {
    currentAudit: state.currentAudit,
    previousAudit: state.previousAudit,
    currentAuditSection: state.currentAuditSection,
    auditListItems: state.auditListItems,
    user: state.user,
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TestResult))
