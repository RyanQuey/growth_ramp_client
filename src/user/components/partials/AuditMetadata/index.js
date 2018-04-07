import { Component } from 'react';
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import {
  SET_CURRENT_AUDIT,
  FETCH_AUDIT_LIST_REQUEST,
  UPDATE_USER_REQUEST,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form, Checkbox } from 'shared/components/elements'
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
    this.toggleHideWhenCompleted = this.toggleHideWhenCompleted.bind(this)
  }

  componentDidMount() {
    if (Object.keys(this.props.audits).length && !this.props.currentAudit) {
      const filterFunc = (audit) => (audit.websiteId === this.props.currentWebsite.id)
      let latestAudit = analyticsHelpers.getLatestAudit({filterFunc})
      this.setCurrentAudit(latestAudit)
    }
  }

  componentWillReceiveProps (props) {
    if (props.currentWebsite.id !== this.props.currentWebsite.id) {
      const filterFunc = (audit) => (audit.websiteId === this.props.currentWebsite.id)
      let latestAudit = analyticsHelpers.getLatestAudit({filterFunc})
      this.setCurrentAudit(latestAudit)
    }
  }

  auditOptions () {
    const {audits, currentWebsite} = this.props

    return Object.keys(audits)
    .filter((id) => audits[id].websiteId === currentWebsite.id)
    .map((id, index) => {
      let audit = audits[id]
      let isLatest = index === Object.keys(audits).length -1

      return {
        label: `${moment(audit.createdAt).format("YYYY-MM-DD")}${isLatest ? " (latest)" : ""}`,
        value: audit.id,
        audit,
      }
    })
  }

  toggleHideWhenCompleted (value) {
    const {user} = this.props
    const cb = (result) => {
      this.setState({pending: false})
    }

    const onFailure = (err) => {
      this.setState({pending: false})
    }

    this.props.updateUser({id: user.id, hideCompletedAuditItems: value}, cb, onFailure)
  }

  selectAuditOption (option) {
    this.setCurrentAudit(option.audit)
  }

  setCurrentAudit (audit) {
    const cb = (result) => {
      this.setState({pending: false})
    }

    const onFailure = (err) => {
      this.setState({pending: false})
    }

    this.setState({pending: true})

    // sets this syncronously
    this.props.setCurrentAudit(audit)

    // get all lists and their items
    this.props.fetchAuditLists({auditId: audit.id, userId: audit.userId}, cb, onFailure, {withListsForPreviousAudit: true})
  }


  render () {
    const {pending, open} = this.state
    const {audits, currentAudit, user} = this.props

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
      <Form className={`${classes.filtersForm}`} onSubmit={this.setSite}>
        <Flexbox className={classes.auditFilters} direction="column">
          {Object.keys(audits).length && (
            <div className={classes.auditSelect}>
              <h3>Current Audit:</h3>
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
                <div className={classes.detail}>{prettyDateLength} ({startDate} - {endDate})</div>
              </Flexbox>
            </div>
          )}
          {currentAudit && (
            <div className={classes.auditOptions}>
              <Flexbox direction="column">
                <h3>Options:</h3>
                <div className={classes.checkbox}>
                  <Checkbox onChange={this.toggleHideWhenCompleted} value={user.hideCompletedAuditItems} label="Hide completed issues"/>
                </div>
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
    fetchAuditLists: (payload, cb, onFailure, options) => dispatch({type: FETCH_AUDIT_LIST_REQUEST, payload, cb, onFailure, options}),
    updateUser: (payload, cb, onFailure) => dispatch({type: UPDATE_USER_REQUEST, payload, cb, onFailure}),
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
