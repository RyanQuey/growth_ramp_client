import { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'shared/components/elements'

//shows up as the most of the content-container in a browser, or totally conditionally in mobile after provider has been chosen
//maybe all of this should fit in its parent instead
const Desc = ({testKey}) => {

  switch (testKey) {
    case "pageSpeed":
      return (<div>According to <a target="_blank" href="https://www.portent.com/blog/design-dev/ultimate-site-speed-guide-why-site-speed-matters.htm?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">Portent</a>, you get the best bang for your buck when you decrease average page load time below 5 seconds.</div>)
    case "headlineStrength":
      return <div>These are pages that have a below average click through rate. We recommend first choosing what keyword you should target before optimizing your headline or metadescription.</div>
    case "browserCompatibility":
      return <div>We’re showing browsers where at least 300 users went to your site last month and that have an above average bounce rate or below average session length.</div>
    case "deviceCompatibility":
      return <div>We’re showing device where at least 300 users went to your site last month and that have an above average bounce rate or below average session length.</div>
    case "userInteraction":
      return <div>We’re showing pages where at least 300 users went to your site last month and that have either an above average bounce rate, or a below average session length or goal completion.</div>
    case "searchPositionToImprove":
      return <div>Content that ranks with an average position between 6 to 20 is often the easiest to increase the sewarch position to get more organic traffic.</div>
    case "missingPages":
      return <div>Pages that have internal and external 404 errors decrease your traffic in Google, and they create bad user experiences. We are showing links that have led to pages that have either “404” or “Page not found” in the title for that month.</div>
  }

}

export default Desc


