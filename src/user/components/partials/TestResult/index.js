import { Component } from 'react';
import { connect } from 'react-redux'
import {
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { AUDIT_TESTS } from 'constants/auditTests'
import {DIMENSIONS_METRICS_FRIENDLY_NAME} from 'constants/analytics'
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
    const { testListsArr, testKey, auditListItems } = this.props
    const testListTypes = AUDIT_TESTS[testKey].lists
console.log("test lists arr", testListsArr);
    return (
      <div className={classes.testResult}>
        {Object.keys(testListTypes).map((listKey, index) => {
          let listMetadata = testListTypes[listKey]
          const list = testListsArr.find((list) => list.listKey === listKey)
          const listItems = auditListItems[list.id]

          return <Flexbox key={listKey} direction="column">
            <Flexbox justify="space-between" align="center">
              <h3>{listMetadata.header}</h3>
              {Object.keys(listMetadata.metrics).map((metric) =>
                <h3 key={metric}>{DIMENSIONS_METRICS_FRIENDLY_NAME[metric]}</h3>
              )}
            </Flexbox>

            {!listItems ? (
              <div>Well done, nothing needs improvement right now!</div>
            ) : (
              Object.keys(listItems).map((itemId) => {
                const item = listItems[itemId]
                return  <Flexbox key={item.dimension} justify="space-between" align="center">
                  <div>{item.dimension}</div>
                  {Object.keys(listMetadata.metrics).map((metric) =>
                    <div key={metric}>{item.metrics[metric]}</div>
                  )}
                </Flexbox>
              })
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
    auditListItems: state.auditListItems,
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TestResult))
