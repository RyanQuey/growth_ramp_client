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
      <table className={classes.table}>
        <tbody>
        <tr>
          <th>Name</th>
          <th>Date Created</th>
          <th>Status</th>
          <th>Plan</th>
          <th>Date Published</th>
          <th></th>
        </tr>
        {campaignIds.map((campaignId, index) => {
          const campaign = this.props.campaigns[campaignId]
          //not sure why this keeps on happening, but it does
          if (!campaign) {return null}
          !campaign.status && console.log(campaign)
          //makes every other class
          let className = (index % 2) == 1 ? "oddRow" : "evenRow"

          const plan = Helpers.safeDataPath(this.props, `plans.${campaign.planId}`, false)
          return (
            <tr key={campaignId} className={classes[className]}>
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
                  plan ? (plan.name || "(Plan has no name)"): "Plan has been archived"
                ) : (
                  "No plan"
                )}
              </td>
              <td>
                {campaign.publishedAt  ? moment(campaign.publishedAt).format("MM-DD-YYYY h:mm a") : "n/a"}
              </td>
              <td>
                <div className={classes.buttonStack}>
                  <Button onClick={this.editCampaign.bind(this, campaign)} small={true}>Edit</Button>
                  <Button onClick={this.showCampaign.bind(this, campaign)} small={true}>Details</Button>
                  {campaign.status === "DRAFT" && ( //make sure not to archive published or partially published campaigns
                    <div className={classes.popupWrapper}>
                      <Button style="danger" onClick={this.toggleDeleting.bind(this, campaign.id)} small={true}>Delete</Button>
                      <ConfirmationPopup
                        show={this.state.deleting === campaign.id }
                        handleClickOutside={this.toggleDeleting.bind(this, false)}
                        onConfirm={this.removeCampaign.bind(this, campaign)}
                        onCancel={this.toggleDeleting.bind(this, false)}
                        pending={this.state.deletePending}
                        dangerous={true}
                      />
                    </div>
                  )}
                </div>
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
