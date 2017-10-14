import React, { Component } from 'react';
import { connect } from 'react-redux'
import {
  Start,
  Send,
  Channels,
  Compose,
  PromoToolFooter
} from 'user/components/partials'
import { Navbar } from 'shared/components/elements'
import { CREATE_POST_REQUEST } from 'constants/actionTypes'
import theme from 'theme'

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
  }

  render() {
    const c = this;
    let tabIndex = 0, contentIndex = 0
    return (
      <div>
        <Navbar className="nav justifyContentCenter navFill" background="white" color={theme.text}>
          <ul role="tablist">
            {Object.keys(sections).map((section) => {
              tabIndex += 1
              return (
                <li key={section} ref={section}>
                  {section}
                </li>
              )
            })}
          </ul>
        </Navbar>

        <div className="tab-conten">
          {this.props.user ? (
            Object.keys(sections).map((section) => {
              contentIndex += 1
              const Tag = sections[section]
              return (
                <div key={section}>
                  {false && <div
                    id={section}
                    key={section}
                    className={`tab-pane ${contentIndex > 1 ? "" : "show active"}`}
                    role="tabpanel"
                    aria-labelledby={`${section}-tab`}
                  >this was when I was using Jquery to move the tabs round</div>}
                  <Tag
                    switchTo={this.switchTo}
                    hide={section !== this.state.currentSection}
                  />
                </div>
              )
            })
          ) : (
            <div> Please login </div>
          )}

        </div>
        <PromoToolFooter
          switchTo={this.switchTo}
          currentSection={this.state.currentSection}
        />
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
const mapDispatchToProps = (dispatch) => {
  return {
    createPostRequest: (data) => dispatch({type: CREATE_POST_REQUEST, payload: data}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PromoTool)


