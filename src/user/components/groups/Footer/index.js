import { Component } from 'react';
import { Button, Flexbox } from 'shared/components/elements'
import classes from './style.scss'


//shows up as the most of the content-container in a browser, or totally conditionally in mobile after provider has been chosen
//maybe all of this should fit in its parent instead
const Footer = () => {

  return (
    <Flexbox className={classes.footerWrapper} justify="center" >
      <Flexbox className={classes.footer} justify="space-around" >
        <a href="/files/growth-ramp-terms-of-service.pdf" target="_blank">Terms of Service</a>
        &nbsp;&nbsp;
        <a href="/files/privacy-policy.pdf" target="_blank">Privacy Policy</a>
      </Flexbox>
    </Flexbox>
  )

}

export default Footer



