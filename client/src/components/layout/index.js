import React, { Component } from 'react';
import helpers from '../../helpers'
import { connect } from 'react-redux'
import Header from './header'
import PromoTool from '../promoTool'

class Layout extends Component {
  constructor() {
    super()
    this.state = {}

  }

  componentDidMount() {

  }

  render() {
    const c = this;
    return (
      <div id="layout">
        <Header />
        <PromoTool />
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

const ConnectedLayout = connect(mapStateToProps)(Layout)
export default ConnectedLayout

