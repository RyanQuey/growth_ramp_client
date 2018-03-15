import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon, Card } from 'shared/components/elements'
import {  } from 'user/components/partials'
import { SET_CURRENT_POST_TEMPLATE, SET_CURRENT_POST, SET_CURRENT_MODAL, UPDATE_PLAN_REQUEST  } from 'constants/actionTypes'
import { TestResult } from 'user/components/groups'
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
    const {contentAudit} = this.props
    if (!Object.keys(contentAudit).length || contentAudit.err) return null

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
            const testResult = contentAudit.results[testKey]
            let totalItemsInResult = testResult && testResult.lists.reduce((acc, list) => (acc + list.items.length), 0)

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
                    <span className={classes.previewText}>({testResult ? totalItemsInResult : "test coming soon"})</span>
                  </div>

                </Flexbox>

                {this.state[testKey] === "open" &&
                  <Flexbox className={`${classes.lists} ${classes.row}`} direction="column" align="center" flexWrap="wrap" justify="space-between">
                    {testResult ? (
                      <TestResult
                        testKey={testKey}
                        testResult={testResult}
                        totalItemsInResult={totalItemsInResult}
                      />
                    ) : (
                      <div>Coming soon</div>
                    )}
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
    user: state.user,
    currentPost: state.currentPost,
    contentAudit: state.contentAudit,
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

