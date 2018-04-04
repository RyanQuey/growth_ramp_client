import { Component } from 'react';
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import {
  SET_CURRENT_AUDIT,
  FETCH_AUDIT_LIST_REQUEST,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { SocialLogin } from 'shared/components/partials'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
import { TIME_RANGE_OPTIONS, } from 'constants/analytics'
import {formActions, alertActions} from 'shared/actions'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'
import analyticsHelpers from 'helpers/analyticsHelpers'

class AuditMetadata extends Component {
  constructor() {
    super()
    this.state = {
      pending: true,
      websiteId: false,
      profileId: false,
    }

    this.selectAuditOption = this.selectAuditOption.bind(this)
    this.setCurrentAudit = this.setCurrentAudit.bind(this)
  }

  componentDidMount() {
    if (Object.keys(this.props.audits).length && !this.props.currentAudit) {
      let auditsArr = Object.keys(this.props.audits).map((auditId) => this.props.audits[auditId])
      // latest audit ... can just do last in array for now :) (will want it sorted like that anyways)
      let latestAudit = auditsArr[auditsArr.length -1]
      this.setCurrentAudit(latestAudit)
    }
  }

  auditOptions () {
    const {audits} = this.props

    return Object.keys(audits).map((id, index) => {
      let audit = audits[id]
      let isLatest = index === Object.keys(audits).length -1

      return {
        label: `${moment(audit.createdAt).format("YYYY-MM-DD")}${isLatest ? " (latest)" : ""}`,
        value: audit.id,
        audit,
      }
    })
  }

  selectAuditOption (option) {
    this.setCurrentAudit(option.audit)
  }

  setCurrentAudit (audit) {
console.log("started");
    const cb = (result) => {
      console.log("finished in callback");
      this.setState({pending: false})
    }

    const onFailure = (err) => {
      console.log("finished in failure");
      this.setState({pending: false})
    }

    this.setState({pending: true})

    // sets this syncronously
    this.props.setCurrentAudit(audit)
console.log("running");
    // get all lists and their items
    this.props.fetchAuditLists({auditId: audit.id, userId: audit.userId}, cb, onFailure)
  }


  render () {
    const {pending} = this.state
    const {audits, currentAudit} = this.props

    const {} = this.state

    const auditOptions = this.auditOptions() || []
    const currentAuditOption = currentAudit && auditOptions.find((option) => option.value === currentAudit.id)

    let prettyDateLength, startDate, endDate
    if (currentAudit) {
      endDate = moment(currentAudit.createdAt).subtract(1, "day").format("YYYY-MM-DD")

      if (currentAudit.dateLength === "month") {
        prettyDateLength = "Monthly Audit"
        startDate = moment(startDate).subtract(1, "month").format("YYYY-MM-DD")

      } else if (currentAudit.dateLength === "quarter") {
        prettyDateLength = "Quarterly Audit"
        startDate = moment(startDate).subtract(3, "months").format("YYYY-MM-DD")

      } else if (currentAudit.dateLength === "year") {
        prettyDateLength = "Yearly Audit"
        startDate = moment(startDate).subtract(1, "year").format("YYYY-MM-DD")
      }
    }

    return (
      <Form className={classes.filtersForm} onSubmit={this.setSite}>
        <Flexbox className={classes.websiteFilters}>
          {Object.keys(audits).length && (
            <div className={classes.websiteSelect}>
              <strong>Current Audit: </strong>
              <Select
                options={auditOptions}
                currentOption={currentAuditOption}
                name="audits"
                onChange={this.selectAuditOption}
              />
            </div>
          )}

          {currentAudit && (
            <div className={classes.auditDetails}>
              <Flexbox direction="column">
                <div className={classes.detail}><strong>Audit Type:</strong></div>
                <div>{prettyDateLength} ({startDate} - {endDate})</div>
              </Flexbox>
            </div>
          )}
        </Flexbox>
      </Form>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentAudit: (audit) => dispatch({type: SET_CURRENT_AUDIT, payload: audit}),
    fetchAuditLists: (payload, cb, onFailure) => dispatch({type: FETCH_AUDIT_LIST_REQUEST, payload, cb, onFailure}),
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    audits: state.audits || {},
    currentAudit: state.currentAudit,
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuditMetadata))
