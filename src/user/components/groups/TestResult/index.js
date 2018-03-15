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
    const { testResult, testKey, totalItemsInResult } = this.props
    const testLists = AUDIT_TESTS[testKey].lists
    const resultLists = testResult.lists

    return (
      <div className={classes.testResult}>
        {Object.keys(testLists).map((listKey, index) => {
          let listMetadata = testLists[listKey]
          const listResults = resultLists.find((list) => list.key === listKey)

          if (totalItemsInResult === 0) {
            return <div>Well done, nothing needs improvement right now!</div>
          }

          return <Flexbox key={listKey} direction="column">
            <Flexbox justify="space-between" align="center">
              <h3>{listMetadata.header}</h3>
              {Object.keys(listMetadata.metrics).map((metric) =>
                <h3 key={metric}>{DIMENSIONS_METRICS_FRIENDLY_NAME[metric]}</h3>
              )}
            </Flexbox>

            {listResults.items.map((item) => {
              return  <Flexbox key={item.dimension} justify="space-between" align="center">
                <div>{item.dimension}</div>
                {Object.keys(listMetadata.metrics).map((metric) =>
                  <div key={metric}>{item[metric]}</div>
                )}
              </Flexbox>
            })}
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
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TestResult))
