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
  }

  componentDidMount() {
    const campaignId = this.props.match.params.campaignId
console.log("campaign ID");
console.log(campaignId);
    const currentCampaign = this.props.campaigns[campaignId]
console.log("current campaign");
console.log(currentCampaign);
    //check if need to retrieve and/or populate posts
    if (!currentCampaign || !currentCampaign.posts) {
      //this action doesn't yet support any criteria
      this.setState({pending: true})
      this.props.fetchCurrentCampaign(campaignId)

    } else if (currentCampaign.status === "PUBLISHED") {
      //is already published, don't let them try to edit from using browser link.
      //will disable link to edit elsewhere if published too
      this.props.history.push("/campaigns")

    } else {

      this.props.setCurrentCampaign(currentCampaign)
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
    const currentCampaign = this.props.campaigns[this.props.match.params.campaignId]

console.log(currentCampaign);
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
              switchTo={this.switchTo}
              initialOpening={this.state.initialOpening}
              currentCampaign={currentCampaign}
            />
          ) : (
            <div>No campaign with id {this.props.match.params.campaignId} found</div>
          )}
        </div>
        <EditCampaignFooter
          switchTo={this.switchTo}
          currentSection={this.state.currentSection}
          currentCampaign={currentCampaign}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    campaigns: state.campaigns,
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


