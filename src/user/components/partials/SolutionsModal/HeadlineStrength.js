import { Component } from 'react';
import { connect } from 'react-redux'
import { Button, Flexbox, Icon } from 'shared/components/elements'

//shows up as the most of the content-container in a browser, or totally conditionally in mobile after provider has been chosen
//maybe all of this should fit in its parent instead
const Solution = ({permission}) => {

  return (
    <Flexbox direction="column">
      <h2>Possible Solutions</h2>
      <ul>
        <li>Use a headline analyzer like <a target="_blank" href="https://coschedule.com/headline-analyzer/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">CoSchedule Headline Analyzer</a> and <a target="_blank" href="http://www.aminstitute.com/headline/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">AMI Analyzer</a></li>
        <li>Include a CTA in your meta description, such as “Click here.”</li>
        <li>Look at PPC ads for your keyword. Include highly emotive and similar keywords to your headline and metadescription.</li>
        <li>Consider including numbers or dates, because numbers often stand out in headlines.</li>
        <li>Use questions that a potential customer might have.</li>
        <li>A/B Test the H1 headline using <a target="_blank" href="">YoRocket</a>.</li>
        <li>Make a change to your H1 and meta descriptions and compare your organic traffic after 1-3 months.</li>
        <li>Read: <a target="_blank" href="https://www.wordstream.com/blog/ws/2016/10/13/organic-seo-ctr-infographic/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">11 Battle-Tested Ways to Raise Your SEO Click-Through Rate</a>.</li>
        <li>Read: <a target="_blank" href="https://moz.com/blog/higher-organic-click-through-conversion-rates-rankings/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">Hacking Your Way to 5x Higher Organic Click-Through Rates (and Better Conversion Rates & Rankings, too)</a>.</li>
        <li>Read/Watch: <a target="_blank" href="https://moz.com/blog/title-tag-hacks-whiteboard-friday/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">7 ‹Title Tag› Hacks for Increased Rankings + Traffic - Whiteboard Friday</a>.</li>
      </ul>
    </Flexbox>
  )
}
const mapStateToProps = state => {
  return {
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Solution)



