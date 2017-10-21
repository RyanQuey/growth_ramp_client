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
    const Tag = sections[this.state.currentSection]
    return (
      <div>
        <Navbar className="nav justifyContentSpaceBetween navFill" background="white" color={theme.color.text}>
          <ul role="tablist">
            {Object.keys(sections).map((section) => (
              <li key={section} ref={section}>
                {this.state.currentSection === section ? (
                  <strong>{section}</strong>
                ) : (
                  <span>{section}</span>
                )}
              </li>
            ))}
          </ul>
        </Navbar>

        <div>
          <Tag
            switchTo={this.switchTo}
          />
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
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    createPostRequest: (data) => dispatch({type: CREATE_POST_REQUEST, payload: data}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PromoTool)


