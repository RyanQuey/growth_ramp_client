import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FETCH_CURRENT_CAMPAIGN_REQUEST, } from 'constants/actionTypes'
import { SavePlanFromCampaign, PostCard } from 'user/components/partials'
import { Button, Form, Card, Flexbox, Icon } from 'shared/components/elements'
import { ButtonGroup } from 'shared/components/groups'
import { PROVIDERS } from 'constants/providers'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'

class ShowCampaign extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pending: false,
      savingPlanFromCampaign: false,
    }

    this.setCampaign = this.setCampaign.bind(this)
    this.editCampaign = this.editCampaign.bind(this)
    this.toggleSavingPlan = this.toggleSavingPlan.bind(this)
    this.finishedSavingAsPlan = this.finishedSavingAsPlan.bind(this)
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
  }

  setCampaign (campaignId) {
    const currentCampaign = this.props.campaigns[campaignId]
    //check if need to retrieve and/or populate posts
    if (!currentCampaign || !currentCampaign.posts) {
      //this action doesn't yet support any criteria
      this.setState({pending: true})
      const getAnalytics = !currentCampaign || currentCampaign.status === "PUBLISHED"
      this.props.fetchCurrentCampaign(campaignId, {getAnalytics})

    } else {
      this.props.setCurrentCampaign(currentCampaign)

    }
  }

  editCampaign (e) {
    //will fetch anyways when we get there, since have to if user goes direcly from the url bar
    this.props.history.push(`/campaigns/${this.props.currentCampaign.id}/edit`)
  }

  toggleSavingPlan(value) {
    let newState = typeof value === "boolean" ? value : !this.state.savingPlanFromCampaign
    this.setState({savingPlanFromCampaign: newState})
  }

  extractCampaignLinks(posts) {
    let links = {}

    for (let post of posts) {
      if (!post.shortUrl) {
        continue

      } else if (!links[post.shortUrl]) {
        links[post.shortUrl] = {
          shortUrl: post.shortUrl,
          analytics: post.analytics,
          posts: [post],
        }
      } else {
        links[post.shortUrl].posts.push(post)
      }
    }

    return links
  }

  finishedSavingAsPlan() {
    this.toggleSavingPlan(false)
  }

  render (){
    const currentCampaign = this.props.currentCampaign || {}
    const campaignPlanName = Helpers.safeDataPath(this.props, `plans.${currentCampaign.planId}.name`, false)

    let links = currentCampaign.posts && _.values(this.extractCampaignLinks(currentCampaign.posts))
    return (
      <div>
        <h1>{currentCampaign.name}{currentCampaign.status === "DRAFT" && "(Draft)"}</h1>
        <div className={classes.content}>
          <h2>Content Url:</h2>&nbsp;{currentCampaign.contentUrl || "(none)"}
          {links && links.length > 0 &&
            <Flexbox direction="column">
              <h2>Analytics</h2>
              {links.map((link) =>
                <Flexbox key={link.shortUrl} direction="column">
                  <div>
                    <div className={`${classes.columnOne} ${classes.tableHeader}`}>Short Link:</div>
                    <div className={`${classes.columnTwo} ${classes.tableHeader}`}>Clicks:</div>
                  </div>
                  <div>
                    <div className={`${classes.columnOne}`}>{link.shortUrl}</div>
                    <div className={`${classes.columnTwo}`}>{Helpers.safeDataPath(link, "analytics.allTime.shortUrlClicks", "")}</div>
                  </div>
                </Flexbox>
              )}
            </Flexbox>
          }
          {currentCampaign.posts && currentCampaign.posts.length ? (
            <div className={classes.posts}>
              <h2>Campaign Posts:</h2>
              <Flexbox flexWrap="wrap" >
                {currentCampaign.posts.map((post) =>
                  <PostCard
                    key={post.id}
                    post={post}
                    className={classes.postCard}
                    height="250px"
                    showIcon={true}
                    showImages={true}
                    showUtms={true}
                    showLink={true}
                  />
                )}
              </Flexbox>
            </div>
          ) : (
            <div>
              No posts yet
            </div>
          )}

          {currentCampaign.status === "PUBLISHED" ? (
            this.state.savingPlanFromCampaign ? (
              <div>
                <SavePlanFromCampaign
                  finished={this.finishedSavingAsPlan}
                />
                <Button style="inverted" onClick={this.toggleSavingPlan}>Cancel</Button>
              </div>
            ) : (
              <div>
                <Button onClick={this.toggleSavingPlan}>Save plan from campaign</Button>
              </div>
            )
          ) : (
            <Button onClick={this.editCampaign}>Continue working on campaign</Button>
          )}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchCurrentCampaign: (campaign, options, cb) => dispatch({
      type: FETCH_CURRENT_CAMPAIGN_REQUEST,
      payload: campaign,
      options,
      cb,
    }),
    setCurrentCampaign: (data) => dispatch({type: SET_CURRENT_CAMPAIGN, payload: data}),
  }
}
const mapStateToProps = (state) => {
  return {
    campaigns: state.campaigns,
    currentCampaign: state.currentCampaign,
    plans: state.plans,
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ShowCampaign))
