import { Component } from 'react';
import { connect } from 'react-redux'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants'

const sections = [
  "Start",
  "Channels",
  "Compose",
  "Send"
]

class PromoToolFooter extends Component {
  constructor() {
    super()

    this.state = {
      //the farthest they got in the workflow
      placeInFlow: "Start"
    }

    this.goBack = this.goBack.bind(this)
  }

  componentWillReceiveProps(props) {
    //if they haven't gone this far yet
    if (props.currentSection && sections.indexOf(this.state.placeInFlow) < sections.indexOf(props.currentSection)) {
      this.setState({placeInFlow: props.currentSection})
    }
  }

  goBack(newIndex) {
    this.props.switchTo(sections[newIndex])
  }

  goForward(newIndex) {
    this.props.switchTo(sections[newIndex])
  }

  render() {
    console.log( this.props );
    const sectionIndex = sections.indexOf(this.props.currentSection)
    const canGoForward = sections.indexOf(this.state.placeInFlow) > sectionIndex && this.props.currentSection !== "Send"

    return (
      <div>
        {this.props.currentSection !== "Start" && <button onClick={this.goBack.bind(sectionIndex-1)}>Back</button>}
        {canGoForward && <button onClick={this.goBack.bind(sectionIndex+1)}>Next</button>}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const ConnectedFooter = connect(mapStateToProps, mapDispatchToProps)(PromoToolFooter)
export default ConnectedFooter
