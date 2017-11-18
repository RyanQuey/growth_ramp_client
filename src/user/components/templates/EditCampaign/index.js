import { Component } from 'react';
import { connect } from 'react-redux'
import {
  Start,
  Send,
  Channels,
  Compose,
  EditCampaignFooter
} from 'user/components/partials'
import { Navbar } from 'shared/components/elements'
import { FETCH_CAMPAIGN_REQUEST, CREATE_CAMPAIGN_REQUEST } from 'constants/actionTypes'
import theme from 'theme'

const sections = {
  Start,
  Channels,
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
    const currentCampaign = this.props.campaigns[this.props.match.params.campaignId]
    if (!currentCampaign) {
      //this action doesn't yet support any criteria
      this.props.fetchCampaignRequest({userId: this.props.user.id})
    }
  }

  //can be called from the EditCampaignFooter or each of the 4 sections
  //initial opening should only be called from the section's componentWillReceiveProps/componentDidMount
  switchTo(next, initialOpening) {
    //const ref = this.refs[next]
console.log(next);
    this.setState({
      currentSection: next,
      initialOpening,
    })
  }

  render() {
    const c = this;
    const Tag = sections[this.state.currentSection]
    const currentCampaign = this.props.campaigns[this.props.match.params.campaignId]

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
    createCampaignRequest: (data) => dispatch({type: CREATE_CAMPAIGN_REQUEST, payload: data}),
    fetchCampaignRequest: (data) => dispatch({type: FETCH_CAMPAIGN_REQUEST, payload: data}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditCampaign)


