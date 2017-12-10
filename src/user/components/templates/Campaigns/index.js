import { Component } from 'react';
import { connect } from 'react-redux'
import {
 EditCampaign
} from 'user/components/templates'
import { CREATE_CAMPAIGN_REQUEST } from 'constants/actionTypes'
import ViewCampaigns from './view'
import {
  withRouter,
  Route,
  Switch,
} from 'react-router-dom'

class Campaigns extends Component {
  constructor() {
    super()
    this.state = {
      //will need to use a store, if this is ever used in subcomponents of the subcomponents
      //currentPost: {},
    }

  }

  render() {
    //const posts = this.props.campaigns
    return (
      <div>
        <ViewCampaigns />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    campaigns: state.campaigns,
    currentCampaign: state.currentCampaign,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    createPostRequest: (data) => dispatch({type: CREATE_CAMPAIGN_REQUEST, payload: data}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Campaigns)


