import { Component } from 'react';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  Start,
  Send,
  Compose,
  EditPlanFooter
} from 'user/components/partials'
import { Navbar } from 'shared/components/elements'
import { FETCH_CURRENT_PLAN_REQUEST, SET_CURRENT_PLAN, CREATE_PLAN_REQUEST } from 'constants/actionTypes'
import theme from 'theme'
import { formActions } from 'shared/actions'

const sections = {
  Start,
  Compose,
  Send,
}

class EditPlan extends Component {
  constructor() {
    super()
    this.state = {
      //will need to use a store, if this is ever used in subcomponents of the subcomponents
      currentSection: "Start",
      initialOpening: true
    }

    this.switchTo = this.switchTo.bind(this)
    this.setPlan = this.setPlan.bind(this)
  }

 componentDidMount() {
    //set current plan based on the url params, no matter what it was before
    const planId = this.props.match.params.planId
    this.setPlan(planId)
  }

  componentWillUnmount() {
    window.onbeforeunload = null
  }

  componentWillReceiveProps (props) {
    if (props.match.params.planId !== this.props.match.params.planId) {
      //editing a new plan, without remounting.
      //this would happen if click "New Plan" while editing a different one
      this.setPlan(props.match.params.planId)

    }

    //give popup if tries to leave while dirty
    //don't set multiple by only setting if doesn't exist yet
    if (props.dirty && !window.onbeforeunload) {
      window.onbeforeunload = function(e) {
        var dialogText = 'Form not saved; Are you sure you want to leave?';
        e.returnValue = dialogText;
        return dialogText;
      };

    } else if (!props.dirty && this.props.dirty) {
      //remove listener
      window.onbeforeunload = null
    }

  }

  setPlan (planId) {
    const currentPlan = this.props.plans[planId]
    //check if need to retrieve and/or populate posts
    if (!currentPlan || !currentPlan.posts) {
      //this action doesn't yet support any criteria
      this.setState({pending: true})
      this.props.fetchCurrentPlan(planId)
      //initializing to match persisted record
      formActions.matchPlanStateToRecord()

    } else if (currentPlan.status !== "DRAFT") {
      //is already published or is archived, don't let them try to edit from using browser link.
      //will disable link to edit elsewhere if published too
      this.props.history.push("/plans")

    } else {

      this.props.setCurrentPlan(currentPlan)
      //initializing to match persisted record
      formActions.matchPlanStateToRecord()
    }

  }

  //can be called from the EditPlanFooter or each of the 4 sections
  //initial opening should only be called from the section's componentWillReceiveProps/componentDidMount
  switchTo(next, initialOpening) {
    //const ref = this.refs[next]
    this.setState({
      currentSection: next,
      initialOpening,
    })
  }

  render() {
    const c = this;
    const Tag = sections[this.state.currentSection]
    const currentPlan = this.props.currentPlan //plans[this.props.match.params.planId]

    return (
      <div>
        <Navbar className="" justify="space-around" background={theme.color.moduleGrayOne} color={theme.color.text}>
          {Object.keys(sections).map((section) => (
            <div key={section} ref={section}>
              {this.state.currentSection === section ? (
                <strong>{section}</strong>
              ) : (
                <span>{section}</span>
              )}
            </div>
          ))}
        </Navbar>

        <div>
          {currentPlan ? (
            <Tag
              pending={this.state.pending}
              switchTo={this.switchTo}
              initialOpening={this.state.initialOpening}
            />
          ) : (
            <div>No plan with id {this.props.match.params.planId} found</div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    plans: state.plans,
    currentPlan: state.currentPlan,
    //if either form is dirty
    dirty: Helpers.safeDataPath(state.forms, "EditPlan.posts.dirty", false) || Helpers.safeDataPath(state.forms, "EditPlan.other.dirty", false) ,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //createPlanRequest: (data) => dispatch({type: CREATE_PLAN_REQUEST, payload: data}),
    fetchCurrentPlan: (data) => dispatch({type: FETCH_CURRENT_PLAN_REQUEST, payload: data}),
    setCurrentPlan: (data) => dispatch({type: SET_CURRENT_PLAN, payload: data}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EditPlan))


