import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Flexbox } from 'shared/components/elements'
import classes from './Navbar.scss'

const Navbar = ({ children, background = "#595959", color = "white", justify, className = ""}) => {

  //splits by one or more spaces, maps them to the classes hashes, and returns as string
  const additionalClasses = className.split(/\s+/).map((c) => (classes[c])).join(" ")
  return (
    <Flexbox align="center" className={`${classes.navbar} ${additionalClasses}`} background={background} color={color} justify={justify || "space-between"} >
      {children}
    </Flexbox>
  )
}

Navbar.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  color: PropTypes.string,
  justify: PropTypes.string,
}
export default Navbar
