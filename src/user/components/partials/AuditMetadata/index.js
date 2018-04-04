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
    if (this.props.audits.length && !this.props.currentAudit) {
      this.setCurrentAudit(this.props.audits[0])
    }
  }

  auditOptions () {
    const {audits} = this.props

    return Object.keys(audits).map((id) => {
      let audit = audits[id]

      return {
        label: audit.createdAt,
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

    let prettyDateLength
    if (currentAudit) {
      if (currentAudit.dateLength === "month") {
        prettyDateLength = "Monthly Audit"
      } else if (currentAudit.dateLength === "year") {
        prettyDateLength = "Yearly Audit"
      } else if (currentAudit.dateLength === "quarter") {
        prettyDateLength = "Quarterly Audit"
      }
    }

    return (
      <Form className={classes.filtersForm} onSubmit={this.setSite}>
        <Flexbox className={classes.websiteFilters}>
          {Object.keys(audits).length && (
            <div className={classes.websiteSelect}>
              <div>Current Audit: </div>
              <Select
                options={auditOptions}
                currentOption={currentAuditOption}
                name="audits"
                onChange={this.selectAuditOption}
              />
            </div>
          )}

          {currentAudit ? (
            <div className={classes.auditDetails}>
              <Flexbox>
                <div className={classes.detail}>Audit Type: {prettyDateLength}</div>
              </Flexbox>

            </div>
          ) : (
            <div>No analytics profiles connected to your google account. </div>
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
