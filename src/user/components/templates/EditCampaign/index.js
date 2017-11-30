import { Component } from 'react';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  Start,
  Send,
  Compose,
  EditCampaignFooter
} from 'user/components/partials'
import { Navbar } from 'shared/components/elements'
import { FETCH_CURRENT_CAMPAIGN_REQUEST, SET_CURRENT_CAMPAIGN, CREATE_CAMPAIGN_REQUEST } from 'constants/actionTypes'
import theme from 'theme'
import { formActions } from 'shared/actions'

const sections = {
  Start,
  Compose,
  Send,
}

class EditCampaign extends Component {
  constructor() {
    super()
    this.state = {
      //will need to use a store, if this is ever used in subcomponents of the subcomponents
      currentSection: "Start",
      initialOpening: true
    }

    this.switchTo = this.switchTo.bind(this)
    this.setCampaign = this.setCampaign.bind(this)
  }

 componentDidMount() {
    //set current campaign based on the url params, no matter what it was before
    const campaignId = this.props.match.params.campaignId
    this.setCampaign(campaignId)
  }

  componentWillUnmount() {
    window.onbeforeunload = null
  }

  componentWillReceiveProps (props) {
    if (props.match.params.campaignId !== this.props.match.params.campaignId) {
      //editing a new campaign, without remounting.
      //this would happen if click "New Campaign" while editing a different one
      this.setCampaign(props.match.params.campaignId)

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

  setCampaign (campaignId) {
    const currentCampaign = this.props.campaigns[campaignId]
    //check if need to retrieve and/or populate posts
    if (!currentCampaign || !currentCampaign.posts) {
      //this action doesn't yet support any criteria
      this.setState({pending: true})
      this.props.fetchCurrentCampaign(campaignId)
      //initializing to match persisted record
      formActions.matchCampaignStateToRecord()

    } else if (currentCampaign.status !== "DRAFT") {
      //is already published or is archived, don't let them try to edit from using browser link.
      //will disable link to edit elsewhere if published too
      this.props.history.push("/campaigns")

    } else {

      this.props.setCurrentCampaign(currentCampaign)
      //initializing to match persisted record
      formActions.matchCampaignStateToRecord()
    }

  }

  //can be called from the EditCampaignFooter or each of the 4 sections
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
    const currentCampaign = this.props.currentCampaign //campaigns[this.props.match.params.campaignId]

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
          {currentCampaign ? (
            <Tag
              pending={this.state.pending}
              switchTo={this.switchTo}
              initialOpening={this.state.initialOpening}
            />
          ) : (
            <div>No campaign with id {this.props.match.params.campaignId} found</div>
          )}
        </div>
        <EditCampaignFooter
          switchTo={this.switchTo}
          currentSection={this.state.currentSection}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    campaigns: state.campaigns,
    currentCampaign: state.currentCampaign,
    //if either form is dirty
    dirty: Helpers.safeDataPath(state.forms, "EditCampaign.posts.dirty", false) || Helpers.safeDataPath(state.forms, "EditCampaign.other.dirty", false) ,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    //createCampaignRequest: (data) => dispatch({type: CREATE_CAMPAIGN_REQUEST, payload: data}),
    fetchCurrentCampaign: (data) => dispatch({type: FETCH_CURRENT_CAMPAIGN_REQUEST, payload: data}),
    setCurrentCampaign: (data) => dispatch({type: SET_CURRENT_CAMPAIGN, payload: data}),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EditCampaign))


