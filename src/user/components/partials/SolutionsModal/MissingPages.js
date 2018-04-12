import { Component } from 'react';
import { connect } from 'react-redux'
import { Button, Flexbox, Icon } from 'shared/components/elements'

//shows up as the most of the content-container in a browser, or totally conditionally in mobile after provider has been chosen
//maybe all of this should fit in its parent instead
const Solutions = ({}) => {

  return (
    <Flexbox direction="column">
      <h2>Possible Solutions for Broken Internal Links</h2>
      <ul>
        <li>Set up a <a target="_blank" href="https://support.google.com/webmasters/answer/93633?hl=en/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">301 redirect</a> for each URL. This redirect makes sure that every user and search engine bot that tries to access the bad URL from now on is redirected to a page that works.</li>
        <li>Go to each URL and check if there is really a link to the false URL and fix the link. This is necessary in addition to the redirect because internal links to redirects create a bad user experience and a bad signal for search engines.</li>
      </ul>

      <h2>Possible Solutions for Broken External Links</h2>
      <ul>
        <li>Go to each URL and check if there is really a link to the false URL and fix the link. This is necessary in addition to setting up the redirect, because external links to 301 redirects are also a bad signal for search engines and have a negative impact on user experience, because they slow down the loading of the next page.</li>
        <li>Reach out to the author and mention the error. Thank them for linking to you, explain to them that changing the link is quick, and will improve their search rankings and user experience.</li>
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

export default connect(mapStateToProps, mapDispatchToProps)(Solutions)


