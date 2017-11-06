import { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Icon, Logo, Button, Flexbox } from 'shared/components/elements'
import { Login } from 'shared/components/partials'
import { connect } from 'react-redux'
import theme from 'theme'
import classes from './style.scss'

import logoUrl from 'images/growth-ramp-logos/GR_logo_only.png' //same as doing Logo
import grTextUrl from 'images/growth-ramp-logos/GR_text.jpg'
import grFullLogoUrl from 'images/growth-ramp-logos/GR_logo.jpg'

class LandingPage extends Component {
  render() {
    const { user } = this.props
    return (
      <div className={classes.landingPageCtn}>
        <div className={classes.headerCtn}>
          <div className={classes.headerContentCtn}>
            <img src={grTextUrl} alt="logo" style={{ maxWidth: '100%' }} />
          </div>
        </div>

        <div>
          <div>
            <Flexbox flexWrap="wrap" justify="center" align="center" className={`${classes.introCtn} ${classes.layerCtn}`}>
              <div className={classes.leftCtn}>
                <h2 >What if you could spend less time tracking links, and more time writing?</h2>
                <h3>Growth Ramp lets you write for your social networks all in one place.</h3>
                <Link to="/signup/create-account"><Button>I&apos;m in! Let&apos;s setup my free profile.</Button></Link>
              </div>
              <div className={classes.rightCtn}>
                <img src={logoUrl} alt="" style={{ maxWidth: '100%' }} />
              </div>
            </Flexbox>
          </div>

          <div className={classes.middleCtn}>
            <Flexbox flexWrap="wrap" justify="center" align="center" className={`${classes.aboutCtn} ${classes.layerCtn}`}>
              <h1>What is Growth Ramp about?</h1>

              <div className={classes.leftCtn}>
                <div className='text-ctn'>
                  <Icon name="clock-o" color="primary" />
                  <h2>Simple but powerful</h2>
                  <h5>Manage your shares with the precision of detail you need but without unnecessary complexity </h5>
                </div>
              </div>
              <div className={classes.rightCtn}>
                <img src={grTextUrl} alt="logo" />
              </div>
            </Flexbox>
          </div>

          <div className={classes.middleCtn}>
            <Flexbox flexWrap="wrap" justify="center" align="center" className={classes.layerCtn}>
              <div className={classes.leftCtn}>
                <div className='text-ctn'>
                  <Icon name="bolt" color="primary" />
                  <h2>Automate your UTMs</h2>
                  <h5>We can take care of this so you don't have to</h5>
                </div>
              </div>
              <div className={classes.rightCtn}>
                <img src={logoUrl} alt="logo" />
              </div>
            </Flexbox>
          </div>

          <div className={classes.imageCtn}>
            <img src={logoUrl} alt="logo" />
          </div>

          <div className={classes.bottomCtn}>
            <Flexbox flexWrap="wrap" justify="flex-start" align="center" className={classes.layerCtn}>
              <p className={classes.bottomText}>
                Growth Ramp <strong>does all of this for you, </strong>simplifying your workflow without compromising on the details.
              </p>
              <Link to="/signup/create-account"><Button style="inverted">I&apos;m in! Let&apos;s setup my profile</Button></Link>
            </Flexbox>
          </div>
        </div>
      </div>
    )
  }
}

LandingPage.propTypes = {
  history: PropTypes.object,
  user: PropTypes.object,
}

const mapStateToProps = (state) => {
  return { user: state.user }
}

export default connect(mapStateToProps)(LandingPage)

