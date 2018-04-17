import { Component } from 'react';
import { connect } from 'react-redux'
import { Button, Flexbox, Icon } from 'shared/components/elements'

//shows up as the most of the content-container in a browser, or totally conditionally in mobile after provider has been chosen
//maybe all of this should fit in its parent instead
const Solution = ({}) => {

  return (
    <Flexbox direction="column">
      <h2>Possible Solutions</h2>
      <ul>
        <li>Check your site on that browser.</li>
        <li>Note potential issues such as slow speed and bad design.</li>
        <li>Talk with your developer team to improve the site for each browser.</li>
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



