import { Component } from 'react';
import { connect } from 'react-redux'
import { Button, Flexbox, Icon } from 'shared/components/elements'

//shows up as the most of the content-container in a browser, or totally conditionally in mobile after provider has been chosen
//maybe all of this should fit in its parent instead
const PermissionRow = ({permission}) => {

  return (
    <Flexbox direction="column">
      <h2>Possible Solutions</h2>
      <ul>
        <li>Add internal links to that page from other pages getting organic traffic.</li>
        <li>Get more links using a service like <a target="_blank" href="https://getcodeless.com/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">Codeless</a> or <a target="_blank" href="http://inboundjunction.com/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">Inbound Junction</a>. Note: if the page has links, it’s easier to build more links to that same page.</li>
        <li>Optimize your on-page SEO. Read: <a target="_blank" href="https://backlinko.com/on-page-seo/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">On-Page SEO: Anatomy of a Perfectly Optimized Page</a> on Backlinko.</li>
        <li>Repromote on social.</li>
        <li>Add more content.</li>
        <li>Read: <a target="_blank" href="https://www.matthewbarby.com/seo-tips/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">19 Actionable SEO Tips to Increase Organic Traffic</a> on MatthewBarby.com.</li>
        <li>Read: <a target="_blank" href="https://www.robbierichards.com/seo/increase-organic-traffic/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">12 “No-BS” Ways to Rapidly Increase Organic SEO Traffic (with Case Studies & Examples)</a>.</li>
        <li>Read: <a target="_blank" href="https://backlinko.com/seo-techniques/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">21 Actionable SEO Techniques That Work GREAT on Backlink.</a></li>
      </ul>
    </Flexbox>
  )

}
const mapStateToProps = state => {
  return {
    user: state.user,
    tokenInfo: state.tokenInfo,
    currentPlan: state.currentPlan,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const ConnectedPermissionRow = connect(mapStateToProps, mapDispatchToProps)(PermissionRow)
export default ConnectedPermissionRow


