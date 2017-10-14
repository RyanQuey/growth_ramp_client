import React, { Component } from 'react';
import { connect } from 'react-redux'
import {
  Start,
  Send,
  Channels,
  Compose,
  PromoToolFooter
} from 'user/components/partials'
import { CREATE_POST_REQUEST } from 'constants/actionTypes'

const sections = {
  Start,
  Channels,
  Compose,
  Send,
}

console.log(sections);
class PromoTool extends Component {
  constructor() {
    super()
    this.state = {
      //will need to use a store, if this is ever used in subcomponents of the subcomponents
      currentSection: "Start",
    }

    this.switchTo = this.switchTo.bind(this)
  }

  componentDidMount() {

  }

  switchTo(next) {
    const ref = this.refs[next]
    this.setState({
      currentSection: next,
    })
    //TODO: want to use refs
    //might be able to use bind and the contentIndex ?
    //$(ref)[0].firstElementChild.click();
  }

  render() {
    const c = this;
    let tabIndex = 0, contentIndex = 0
    return (
      <div></div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    posts: state.posts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    createPostRequest: (data) => dispatch({type: CREATE_POST_REQUEST, payload: data}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PromoTool)


