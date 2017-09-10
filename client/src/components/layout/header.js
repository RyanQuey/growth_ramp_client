import React, { Component } from 'react';
import helpers from '../../helpers'
import { connect } from 'react-redux'
import Login from '../login';

class Header extends Component {
  constructor() {
    super()
    this.state = {}

  }

  componentDidMount() {

  }

  render() {
    const c = this;
    return (
      <div id="layout-header">
        <div className="navbar navbar-expand-lg navbar-light bg-light">
          <a className="navbar-brand" href="#"><h2>Welcome</h2></a>
          <Login />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    posts: state.posts,
  }
}

const ConnectedHeader = connect(mapStateToProps)(Header)
export default ConnectedHeader

