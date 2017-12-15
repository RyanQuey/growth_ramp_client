import { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Icon, Logo, Button, Flexbox } from 'shared/components/elements'
import { Login } from 'shared/components/partials'
import { connect } from 'react-redux'
import theme from 'theme'
import classes from './style.scss'
import {SET_CURRENT_MODAL} from 'constants/actionTypes'

//GR logos
import logoUrl from 'images/growth-ramp-logos/GR_logo_only.png' //same as doing Logo
//png has transparent background
import grTextUrl from 'images/growth-ramp-logos/GR_text.png'
import grFullLogoUrl from 'images/growth-ramp-logos/GR_logo.jpg'

//other images
import laptopAnalyticsUrl from 'images/landing-page/laptop-with-analytics.jpg'
import organizedDeskUrl from 'images/landing-page/organized-desk.jpg'
//import coffeeMeetingUrl from 'images/landing-page/people-coffee-meeting.jpg'
//import phoneGraphsUrl from 'images/landing-page/phone-with-graphs-printed.jpg'
//import planningJournalUrl from 'images/landing-page/planning-journal.jpg'
//import womanWorkingUrl from 'images/landing-page/woman-working-at-computer.jpg'
//import workingAtDeskUrl from 'images/landing-page/working-at-desk.jpg'
import menAtWhiteboardUrl from 'images/landing-page/men-at-whiteboard.jpg'

class LandingPage extends Component {
  constructor(props) {
    super(props)

    this.openLoginModal = this.openLoginModal.bind(this)
  }

  openLoginModal(e) {
    e.preventDefault()
    this.props.setCurrentModal("UserLoginModal")
  }

  render() {
    const { user } = this.props

    return (
      <div className={classes.landingPage}>
        <div className={classes.headerCtn}>
          <div className={`${classes.contentCtn} ${classes.headerContentCtn}`}>
            <img src={grTextUrl} alt="Growth Ramp" style={{ maxWidth: '100%' }} />
            <Flexbox flexWrap="wrap" justify="center" align="center" className={`${classes.introCtn} ${classes.layerCtn}`}>
              <h1>A simple solution to save time on content promotion</h1>
              <h2>Promote content systematically, reach new audiences, and get actionable data to take your content marketing to the next level.</h2>
              <Button onClick={this.openLoginModal}>Signup Now</Button>
            </Flexbox>
          </div>
        </div>

        <div className={`${classes.layerCtn} ${classes.oddCtn}`}>
          <a name="features" />
          <div className={`${classes.contentCtn}`}>
            <Flexbox flexWrap="wrap" justify="center" align="center" className={classes.contentWrapper}>
              <div className={`${classes.leftSection} ${classes.textCtn}`}>
                <h1>Simple Time-Saving Promotion Plans</h1>
                <p>Create promotion plans to <strong>systematically promote your content</strong>, clients’ content, or personal guest posts.</p>
                <p>This allows you to remove the annoying “busywork” of knowing where to promote your content by creating ready-to-use plans for buyer personas, multiple clients, and for guest posts in one simple step.</p>
              </div>
              <div className={classes.rightSection}>
                <img src={organizedDeskUrl} style={{ maxWidth: '100%' }} />
              </div>

            </Flexbox>
          </div>
        </div>

        <div className={`${classes.layerCtn} ${classes.evenCtn}`}>
          <div className={`${classes.contentCtn}`}>
            <Flexbox flexWrap="wrap" justify="center" align="center" direction="row-reverse" className={classes.contentWrapper}>
              <div className={`${classes.rightSection} ${classes.textCtn}`}>
                <h1>Eliminate Dark Traffic</h1>
                <p>Get better insight on the success of your traffic sources with <strong>UTM tracking links that auto-magically attach to every promotion channel </strong>you share your content in.</p>
                <p>UTMs will allow you to quickly see what’s working:</p>
                <ul>
                  <li>In a broad channel (e.g. Facebook Groups)</li>
                  <li>The specific channel you are promoting in (e.g. a Facebook Group called “Adidas are Awesome!”), and</li>
                  <li>The specific campaign plan you are using.</li>
                </ul>
                <p>Additionally, you will begin to discover new platforms and audiences you wouldn't have considered before.</p>
              </div>

              <div className={`${classes.leftSection} ${classes.imageCtn}`}>
                <img src={menAtWhiteboardUrl}/>
              </div>
            </Flexbox>
          </div>
        </div>

        <div className={`${classes.layerCtn} ${classes.oddCtn}`}>
          <div className={`${classes.contentCtn}`}>
            <Flexbox flexWrap="wrap" justify="center" align="center" className={classes.contentWrapper}>
              <div className={`${classes.leftSection} ${classes.textCtn}`}>
                <h1>Coming Soon: ROI Dashboard</h1>
                <p>Get traffic estimates in a simple dashboard to <strong>quickly tell you what promotion channels work.</strong></p>
                <p>This allows you you to know <strong>how to improve your content promotion process </strong>and know where to focus your time for future campaigns.</p>
              </div>

              <div className={classes.rightSection}>
                <img src={laptopAnalyticsUrl} />
              </div>
            </Flexbox>
          </div>
        </div>

        <div className={`${classes.layerCtn} ${classes.evenCtn}`}>
          <div className={`${classes.contentCtn}`}>
            <Flexbox direction="column" flexWrap="wrap" justify="center" align="center" className={classes.bottomContentWrapper}>
              <a name="pricing" /><h1>Pricing</h1>
              <p>Unlimited promotion plans</p>
              <p>Automatic UTM Tracking</p>
              <p>ROI Dashboard (when available)</p>
              <p><strong>$49 per month</strong></p>
              <Button onClick={this.openLoginModal}>Get Started</Button>
            </Flexbox>
          </div>
        </div>

      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
  }
}

const mapStateToProps = (state) => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage)

