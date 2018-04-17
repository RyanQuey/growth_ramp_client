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
        <li>Check your page. Is there a speed or design issue?</li>
        <li>If the page has no external links and no traffic, consider deleting the page. <a target="_blank" href="https://www.robbierichards.com/seo/increase-organic-traffic/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">Here’s why</a>.</li>
        <li>If the page has a few external links and no traffic, consider merging the content. <a target="_blank" href="https://www.robbierichards.com/seo/increase-organic-traffic/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">Here’s why</a>.</li>
        <li>If the page has a lot of traffic, consider including a clear call to action so users know what the next step should be.</li>
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



