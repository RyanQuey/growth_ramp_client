import { Component } from 'react';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  UPDATE_CUSTOM_LIST_REQUEST,
  CREATE_CUSTOM_LIST_REQUEST,
} from 'constants/actionTypes'
import { Input, Button, Card, Flexbox } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { ButtonGroup, ConfirmationPopup } from 'shared/components/groups'
import { PlanPicker } from 'user/components/partials'
import { formActions, alertActions } from 'shared/actions'
import classes from './style.scss'

const operatorOptions = [
  {label: "greater than", value: "GREATER_THAN"},
  {label: "less than", value: "LESS_THAN"},
  {label: "equal to", value: "EQUAL"},
]

class CustomListForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      errors: [],
      pending: false,
    }

    this.handleErrors = this.handleErrors.bind(this)
    this.handleChangeName = this.handleChangeName.bind(this)
    this.handleChangeDescription = this.handleChangeDescription.bind(this)
    this.save = this.save.bind(this)
    this.archive = this.archive.bind(this)

    this.goalOptions = this.goalOptions.bind(this)
    this.selectGoal = this.selectGoal.bind(this)
    this.selectOperator = this.selectOperator.bind(this)
    this.handleComparisonValue = this.handleComparisonValue.bind(this)
  }

  //eventually will have to handle differently, probably wit errors store, if want to validate name too
  handleErrors (errors, inputName) {
    this.setState({errors })
  }

  toggleRemoving (value = !this.state.removing) {
    this.setState({removing: value})
  }

  archive () {
    this.setState({deletePending: true})

    // note that other of these params might have changed, but not these ids
    const {id, userId} = this.props.params

    const cb = () => {
      onSuccess && onSuccess()
      this.setState({deletePending: false, removing: false})
    }
    const onFailure = (err) => {
      this.setState({deletePending: false})
      alertActions.newAlert({
        title: "Failure to remove customList: ",
        level: "DANGER",
        message: err.message || "Unknown error",
        options: {timer: false},
      })
    }

    const params = {id, status: "ARCHIVED", userId}

    this.props.updateCustomListRequest(params, cb, onFailure)
  }

  // right now only using this
  selectGoal (option) {
    const newParams = Object.assign({}, this.props.params)
    _.set(newParams, `metricFilters.0.metricName`, `ga:goal${option.goal.id}Completions`)

    formActions.setParams("CustomList", "data", newParams)
  }

  selectTest (option) {
    formActions.setParams("CustomList", "data", {testKey: option.value})
  }

  handleChangeDescription (value, e, errors) {
    formActions.setParams("CustomList", "data", {description: value})
  }

  handleChangeName (value, e, errors) {
    formActions.setParams("CustomList", "data", {name: value})
  }

  selectOperator (option) {
    const newParams = Object.assign({}, this.props.params)
    _.set(newParams, `metricFilters.0.operator`, option.value)

    formActions.setParams("CustomList", "data", newParams)

  }

  handleComparisonValue (value, e, errors) {
    if (value && (!parseInt(value) || value < -1)) {
      alertActions.newAlert({
        title: "Value must be a positive integer",
        level: "DANGER",
      })
      return
    }

    const newParams = Object.assign({}, this.props.params)
    _.set(newParams, `metricFilters.0.comparisonValue`, value)

    formActions.setParams("CustomList", "data", newParams)
  }

  goalOptions () {
    const {goals, website} = this.props
    const siteGoals = Helpers.safeDataPath(goals, `${website.id}.items`, []).filter((goal) => goal.active)

    return siteGoals.map((goal) => ({label: goal.name, value: goal.id, goal}))
  }

  save(e) {
    e && e.preventDefault()
    const {goals, params, dirty, user, website, onSuccess} = this.props
    if (!params.name) {

      alertActions.newAlert({
        title: "Failed to save:",
        message: "Name is required",
        level: "DANGER",
      })
      return
    }

    const onFailure = () => {
      this.setState({pending: false})
    }

    const cb = () => {
      this.setState({pending: false})
      formActions.clearParams("CustomList", "data")

      onSuccess && onSuccess()
    }

    const paramsToSend = Object.assign({}, params, {
      userId: user.id, websiteId: website.id,
      dimensions: [{name: "ga:landingPagePath"}], // TODO eventually users can customize this too
      testKey: "userInteraction",
    })
    this.setState({pending: true})

    if (params.id) {
      this.props.updateCustomListRequest(paramsToSend, cb, onFailure)
    } else {
      this.props.createCustomListRequest(paramsToSend, cb, onFailure)
    }
  }

  render() {
    const { user, website, goals, params, hide }  = this.props
    const { pending }  = this.state

    if (hide || !website) {
      return null
    }

    const siteGoals = Helpers.safeDataPath(goals, `${website.id}.items`, [])

    const goalOptions = this.goalOptions()
    const currentGoalOption = goalOptions.find(option => Helpers.safeDataPath(params, `metricFilters.0.metricName`, "").includes(option.goal.id))
    const currentOperatorOption = operatorOptions.find(option => option.value === Helpers.safeDataPath(params, `metricFilters.0.operator`))

    const ready = params.name && params.metricFilters && params.metricFilters.every((f) => f.metricName && f.operator && f.comparisonValue)
    const editing = !!params.id

    return (
      <form onSubmit={this.save}>
        <h2>{editing ? `Editing ${params.name}` : "New Custom List"}</h2>
        <h4>Name*</h4>
        <Input
          className={classes.input}
          value={params.name}
          validations={["required"]}
          onChange={this.handleChangeName}
        />
        <br/>

        <h4>Description</h4>
        <Input
          className={classes.input}
          value={params.description}
          onChange={this.handleChangeDescription}
        />
        <br/>
        <h4>Filter</h4>
        <div className={classes.filterForms}>
          <span>Return every page that has</span>
          &nbsp;
          <Select
            className={`${classes.select} ${classes.operator}`}
            options={operatorOptions}
            onChange={this.selectOperator}
            currentOption={currentOperatorOption}
            name="select-operator"
          />
          &nbsp;
          <Input
            className={classes.input}
            value={Helpers.safeDataPath(params, `metricFilters.0.comparisonValue`, "")}
            validations={["required"]}
            onChange={this.handleComparisonValue}
          />
          &nbsp;
          <span>goal conversions</span>
        </div>

        <div className={classes.filterForms}>
          <span>for goal</span>
          &nbsp;
          <Select
            className={`${classes.select} ${classes.goal}`}
            options={goalOptions}
            onChange={this.selectGoal}
            currentOption={currentGoalOption}
            name="select-goal"
          />
        </div>

        <br/>
        <Flexbox justify="space-between">
          {editing &&
            <div className={classes.popupWrapper}>
              <Button style="danger" onClick={this.toggleRemoving.bind(this, true)} small={true}>Remove</Button>
              <ConfirmationPopup
                show={this.state.removing}
                handleClickOutside={this.toggleRemoving.bind(this, false)}
                onConfirm={this.archive}
                onCancel={this.toggleRemoving.bind(this, false)}
                pending={this.state.deletePending}
                dangerous={true}
                side="top"
                float="right"
                confirmationText="Are you sure you want to remove this custom list?"
              />
            </div>
          }

          <div>
            <Button style="inverted" disabled={pending} onClick={this.props.onCancel} small={true}>Cancel</Button>
            <Button type="submit" disabled={!ready} pending={pending} small={true}>Save</Button>
          </div>
        </Flexbox>
      </form>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    goals: state.goals,
    params: Helpers.safeDataPath(state.forms, "CustomList.data.params", {name: "", metricFilters: [], dimensions: []}),
    dirty: Helpers.safeDataPath(state.forms, "CustomList.data.dirty", false),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    createCustomListRequest: (payload, cb, onFailure) => dispatch({type: CREATE_CUSTOM_LIST_REQUEST, payload, cb, onFailure}),
    updateCustomListRequest: (payload, cb, onFailure) => dispatch({type: UPDATE_CUSTOM_LIST_REQUEST, payload, cb, onFailure}),
  }
}

const ConnectedCustomListForm = withRouter(connect(mapStateToProps, mapDispatchToProps)(CustomListForm))
export default ConnectedCustomListForm
