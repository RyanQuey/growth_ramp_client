import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FETCH_CURRENT_CAMPAIGN_REQUEST, SET_CURRENT_CAMPAIGN, SET_CURRENT_MODAL, } from 'constants/actionTypes'
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
    //this.openCreateLinkModal = this.openCreateLinkModal.bind(this)
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
    /*if (props.match.params.campaignId !== this.props.match.params.campaignId) {
      //editing a new campaign, without remounting.
      //this would happen if click "New Campaign" while editing a different one
      this.setCampaign(props.match.params.campaignId)
    }*/
  }

  setCampaign (campaignId) {
    const currentCampaign = this.props.campaigns[campaignId]
    //UPDATE just reload it; maybe optimize later
    //makes sure not showing it as draft when just published, etc
    //Otherwise, latest clicks wouldn't register either, if they haven't closed app in awhile or something
    //if (!currentCampaign || !currentCampaign.posts) {
      //this action doesn't yet support any criteria
      this.setState({pending: true})
      this.props.fetchCurrentCampaign(campaignId, {getAnalytics: true})

    //} else {
      //this.props.setCurrentCampaign(currentCampaign)

    //}
  }

  editCampaign (e) {
    //will fetch anyways when we get there, since have to if user goes direcly from the url bar
    this.props.history.push(`/campaigns/${this.props.currentCampaign.id}/edit`)
  }

  toggleSavingPlan(value) {
    let newState = typeof value === "boolean" ? value : !this.state.savingPlanFromCampaign
    this.setState({savingPlanFromCampaign: newState})
  }

  /*
 * not doing this anymore; try to make more like a pseudo-post
  openCreateLinkModal() {
    this.props.setCurrentModal("CreateLinkModal", {
      items: "utms",
      form: "CampaignLink",
    })
  }
  */

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
        <h1>{currentCampaign.name}{currentCampaign.status === "DRAFT" && " (Draft)"}</h1>
        <div className={classes.content}>
          <h2>Content Url:</h2>&nbsp;{currentCampaign.contentUrl || "(none)"}
          {false && <Button onClick={this.openCreateLinkModal}>Create Link for Other Provider</Button>}

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
                    subtitle={post.publishedAt ? "" : "Unpublished"}
                    post={post}
                    className={classes.postCard}
                    height="260px"
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

            <Button style="inverted" onClick={this.editCampaign}>Continue working on campaign</Button>
            {this.state.savingPlanFromCampaign ? (
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
    setCurrentModal: (payload, modalOptions) => dispatch({type: SET_CURRENT_MODAL, payload, options: modalOptions}),
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
