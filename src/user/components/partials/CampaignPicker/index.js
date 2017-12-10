import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { userActions, errorActions } from 'shared/actions'
import { Button, Flexbox, Input } from 'shared/components/elements'
import { ButtonGroup, ConfirmationPopup } from 'shared/components/groups'
import {
  FETCH_CURRENT_CAMPAIGN_REQUEST,
  DESTROY_CAMPAIGN_REQUEST,
  SET_CURRENT_CAMPAIGN,
  SET_CURRENT_MODAL,
} from 'constants/actionTypes'


import classes from './style.scss'

class CampaignPicker extends Component {
  constructor(props) {
    super(props)

    this.state = {
      deleting: false,
      deletePending: false,
    }

    this.editCampaign = this.editCampaign.bind(this)
    this.showCampaign = this.showCampaign.bind(this)
    this.removeCampaign = this.removeCampaign.bind(this)
    this.toggleDeleting = this.toggleDeleting.bind(this)
  }

  showCampaign (campaign, e) {
    this.props.history.push(`/campaigns/${campaign.id}`)
  }

  editCampaign (campaign, e) {
    //will fetch anyways when we get there, since have to if user goes direcly from the url bar
    this.props.history.push(`/campaigns/${campaign.id}/edit`)
  }

  removeCampaign (campaign, e) {
    //might just archive, but leaving that to the api to figure out :)
    this.setState({deletePending: true})

    const cb = () => {
      this.setState({deletePending: false})
      this.toggleDeleting(false)
    }

    this.props.destroyCampaignRequest(campaign, cb)
  }

  //can be id or false
  toggleDeleting (campaignId) {
    const newState = typeof value === "boolean" ? value : !this.state.deleting
    this.setState({deleting: campaignId})
  }

  render() {
    let campaignIds = Object.keys(this.props.campaigns || {})
    //reversing to put newest on top; since I think organized by id by default
    campaignIds.reverse()

    //TODO: set the title using props into the modal container (will do a modal...or just a show view?? for each campaign)
    //use flexbox. Assign consistent column lengths to still achieve tablelike look, but with control over spacing etc.
    return (
      <table>
        <tbody>
        <tr>
          <th>Name</th>
          <th>Date Created</th>
          <th>Status</th>
          <th>Plan</th>
          <th>Date Published</th>
          <th></th>
        </tr>
        {campaignIds.map((campaignId) => {
          const campaign = this.props.campaigns[campaignId]
console.log(campaign)
          //not sure why this keeps on happening, but it does
          if (!campaign) {return null}

          const plan = Helpers.safeDataPath(this.props, `plans.${campaign.planId}.name`, false)
          return (
            <tr key={campaignId}>
              <td>
                {campaign.name || "No name"}
              </td>
              <td>
                {moment(campaign.createdAt).format("MM-DD-YYYY h:mm a")}
              </td>
              <td>
                {campaign.status.titleCase()}
              </td>
              <td>
                {campaign.planId ? (
                  plan ? plan.name : "Plan has been archived"
                ) : (
                  "No plan"
                )}
              </td>
              <td>
                {campaign.publishedAt ? moment(campaign.publishedAt).format("MM-DD-YYYY h:mm a") : "Unpublished"}
              </td>
              <td>
                <ButtonGroup vertical={true}>
                  {campaign.status !== "PUBLISHED" && <Button onClick={this.editCampaign.bind(this, campaign)}>Edit Draft</Button>}
                  <Button onClick={this.showCampaign.bind(this, campaign)}>View Details</Button>
                  {campaign.status !== "PUBLISHED" && (
                    <div className={classes.popupWrapper}>
                      <Button onClick={this.toggleDeleting.bind(this, campaign.id)}>Delete</Button>
                      {this.state.deleting === campaign.id &&
                        <ConfirmationPopup
                          onConfirm={this.removeCampaign.bind(this, campaign)}
                          onCancel={this.toggleDeleting.bind(this, false)}
                          pending={this.state.deletePending}
                          dangerous={true}
                        />
                      }
                    </div>
                  )}
                </ButtonGroup>
              </td>
            </tr>
          )
        })}
        </tbody>
      </table>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchCurrentCampaign: (campaign, options, cb) => dispatch({type: FETCH_CURRENT_CAMPAIGN_REQUEST, payload: campaign, options, cb}),
    setCurrentCampaign: (campaign) => dispatch({type: SET_CURRENT_CAMPAIGN, payload: campaign}),
    destroyCampaignRequest: (campaign, cb) => dispatch({type: DESTROY_CAMPAIGN_REQUEST, payload: campaign, cb}),
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload})
  }
}

const mapStateToProps = (state) => {
  return {
    campaigns: state.campaigns,
    currentCampaign: state.currentCampaign,
    plans: state.plans,
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CampaignPicker))
