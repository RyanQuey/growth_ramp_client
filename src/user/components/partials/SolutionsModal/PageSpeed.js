import { Component } from 'react';
import { connect } from 'react-redux'
import { Button, Flexbox, Icon } from 'shared/components/elements'

//shows up as the most of the content-container in a browser, or totally conditionally in mobile after provider has been chosen
//maybe all of this should fit in its parent instead
const Solutions = ({}) => {

  return (
    <Flexbox direction="column">
      <h2>Identifying the specific issues</h2>
      <p>Use one of these sites to test the page:</p>
      <ul>
        <li><a target="_blank" href="https://www.webpagetest.org/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">WebPagetest</a></li>
        <li><a target="_blank" href="https://gtmetrix.com/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">GTmetrix</a></li>
        <li><a target="_blank" href="https://tools.pingdom.com/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">Pingdom</a></li>
      </ul>

      <div>Check the page and the website itself for...</div>
      <ul>
        <li>Large multimedia files like gifs, videos, or big pictures.</li>
        <li>Page redirects to another page.</li>
        <li>Excessive and/or outdated plugins</li>
        <li>Outdated content management system (i.e. Wordpress, Drupal, or Wix)</li>
      </ul>

      <h2>Possible Solutions</h2>
      <ul>
        <li>Upgrade your web host. This includes upgrading the server capacity, or to a new company such as <a target="_blank" href="https://mediatemple.net/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">MediaTemple</a> or <a target="_blank" href="https://kinsta.com/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">Kinsta</a>.</li>
        <li>Use a CDN, such as <a target="_blank" href="https://www.cloudflare.com/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">CloudFlare</a>, <a target="_blank" href="https://www.maxcdn.com/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">MaxCDN</a>, or <a target="_blank" href="https://www.keycdn.com/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">KeyCDN</a>.</li>
        <li>Minimize redirects. We suggest reading <a target="_blank" href="https://kinsta.com/blog/wordpress-redirect/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">WordPress Redirect – Best Practices For Faster Performance</a> on Kinsta.</li>
        <li>Compress images. Use an image compressor like <a target="_blank" href="http://www.jpegmini.com/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">JPEGmini</a> or <a target="_blank" href="https://wordpress.org/plugins/wp-smushit/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">WPMU Dev’s Smush</a> plugin.</li>
        <li>Consider enabling Gzip. <a target="_blank" href="https://checkgzipcompression.com/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">Check if your site has GZIP compression here</a>. Read <a target="_blank" href="https://gtmetrix.com/enable-gzip-compression.html/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">Enable gzip compression</a> by GTmetrix to learn how to do it.
</li>
        <li>Give your page speed test to your developer team to fix.</li>
        <li>Read: <a target="_blank" href="https://www.crazyegg.com/blog/speed-up-your-website/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">20 Ways to Speed Up Your Website and Improve Conversion</a> on CrazyEgg.</li>
        <li>Read: <a target="_blank" href="https://mediatemple.net/community/products/dv/204403944/why-is-my-website-slow/?utm_campaign=tool&utm_medium=tip&utm_source=GrowthRamp.io">Why is my website slow?</a> on MediaTemple.</li>
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


