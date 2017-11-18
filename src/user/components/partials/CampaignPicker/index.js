import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { userActions, errorActions } from 'shared/actions'
import { Button, Flexbox, Input } from 'shared/components/elements'
import { ButtonGroup } from 'shared/components/groups'
import {
  SET_CAMPAIGN,
  DESTROY_CAMPAIGN_REQUEST,
} from 'constants/actionTypes'


import classes from './style.scss'

class CampaignPicker extends Component {
  constructor(props) {
    super(props)

    this.editCampaign = this.editCampaign.bind(this)
    this.removeCampaign = this.removeCampaign.bind(this)
  }

  editCampaign (campaign, e) {
    this.props.history.push(`/campaigns/${campaign.id}/edit`)
  }

  removeCampaign (campaign, e) {
    //might just archive, but leaving that to the api to figure out :)
    this.props.destroyCampaignRequest(campaign)
  }

  render() {
    const campaigns = this.props.campaigns

    //TODO: set the title using props into the modal container (will do a modal...or just a show view?? for each campaign)
    //use flexbox. Assign consistent column lengths to still achieve tablelike look, but with control over spacing etc.
    return (
      <table>
        <tbody>
        <tr>
          <th>Date Created</th>
          <th>Status</th>
          <th>Plan</th>
          <th>Date Published</th>
          <th></th>
        </tr>
        {campaigns && Object.keys(campaigns).map((campaignId) => {
          const campaign = campaigns[campaignId]
          return (
            <tr key={campaignId}>
              <td>
                {moment(campaign.createdAt).format("MM-DD-YYYY hh:mm")}
              </td>
              <td>
                {campaign.status.titleCase()}
              </td>
              <td>
                {(campaign.planId && this.props.plans[campaign.planId].name) || "No plan"}
              </td>
              <td>
                {campaign.publishedAt ? moment(campaign.publishedAt).format("mm-dd-yyyy hh:mm") : "Unpublished"}
              </td>
              <td>
                <ButtonGroup vertical={true}>
                  <Button onClick={this.editCampaign.bind(this, campaign)}>Edit</Button>
                  {campaign.status === "DRAFT" && <Button onClick={this.removeCampaign.bind(this, campaign)}>Delete</Button>}
                  <Button disabled={true}>View Details</Button>
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
    setCampaign: (campaign) => dispatch({type: SET_CAMPAIGN, payload: campaign}),
    destroyCampaignRequest: (campaign) => dispatch({type: DESTROY_CAMPAIGN_REQUEST, payload: campaign}),
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
