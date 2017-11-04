import { Component } from 'react';
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
      initialOpening: true
    }

    this.switchTo = this.switchTo.bind(this)
  }

  componentDidMount() {

  }

  //can be called from the promoToolFooter or each of the 4 sections
  //initial opening should only be called from the section's componentWillReceiveProps/componentDidMount
  switchTo(next, initialOpening) {
    //const ref = this.refs[next]
console.log(next);
    this.setState({
      currentSection: next,
      initialOpening,
    })
  }

  render() {
    const c = this;
    const Tag = sections[this.state.currentSection]
    return (
      <div>
        <Navbar className="" justify="space-around" background="white" color={theme.color.text}>
          {Object.keys(sections).map((section) => (
            <div key={section} ref={section}>
              {this.state.currentSection === section ? (
                <strong>{section}</strong>
              ) : (
                <span>{section}</span>
              )}
            </div>
          ))}
        </Navbar>

        <div>
          <Tag
            switchTo={this.switchTo}
            initialOpening={this.state.initialOpening}
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


