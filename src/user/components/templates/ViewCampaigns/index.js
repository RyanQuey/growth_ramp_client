import { Component } from 'react';
import { connect } from 'react-redux'
import { FETCH_CAMPAIGN_REQUEST, CREATE_CAMPAIGN_REQUEST } from 'constants/actionTypes'
import { Button, Flexbox } from 'shared/components/elements'
import {
  CampaignTable
} from 'user/components/partials'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'

class ViewCampaigns extends Component {
  constructor() {
    super()
    this.state = {
      status: "pending",
    }

    this.handleChooseCampaign = this.handleChooseCampaign.bind(this)
    this.createCampaign = this.createCampaign.bind(this)
  }

  componentWillMount() {
    this.props.fetchCampaignRequest({userId: this.props.user.id})
  }

  componentWillReceiveProps(props) {
    if (props.campaigns !== this.props.campaigns) {
      this.setState({status: "ready"})
    }
  }

  createCampaign() {
    //to run on success
    const cb = (newCampaign) => {
      this.props.history.push(`/campaigns/${newCampaign.id}/edit`)
    }

    this.props.createCampaignRequest(cb)
  }

  handleChooseCampaign(campaign) {
    this.setState({
      campaign,
    })
    //TODO: want to use refs
    //might be able to use bind and the contentIndex ?
    //$(ref)[0].firstElementChild.click();
  }


  render () {
    return (
      <div>
        <h1>Campaigns</h1>
        {Object.keys(this.props.campaigns).length > 0 ? (
          <div>
            <Button className={classes.topNewCampaignButton} onClick={this.createCampaign}>New campaign</Button>

            <Flexbox justify="center">
              <CampaignTable />
            </Flexbox>
          </div>
        ) : (
          <div>
            <h3>No campaigns yet.</h3>
            <div>Let's create a new one</div>
          </div>
        )}
        {Object.keys(this.props.campaigns).length === 0 || Object.keys(this.props.campaigns).length > 4 && (
          <Button onClick={this.createCampaign}>New campaign</Button>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchCampaignRequest: (data) => dispatch({type: FETCH_CAMPAIGN_REQUEST, payload: data}),
    createCampaignRequest: (cb) => {
      const newCampaign = {
        userId: store.getState().user.id,
      }

      return dispatch({type: CREATE_CAMPAIGN_REQUEST, payload: newCampaign, cb})
    },
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    campaigns: state.campaigns,
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewCampaigns))
