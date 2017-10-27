import { Component } from 'react';
import { connect } from 'react-redux'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
import { Button } from 'shared/components/elements'

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

    this.go = this.go.bind(this)
  }

  componentWillReceiveProps(props) {
    //if they haven't gone this far yet
    if (props.currentSection && sections.indexOf(this.state.placeInFlow) < sections.indexOf(props.currentSection)) {
      this.setState({placeInFlow: props.currentSection})
    }
  }

  go(newIndex, e) {
    this.props.switchTo(sections[newIndex])
  }

  render() {
    const sectionIndex = sections.indexOf(this.props.currentSection)
    const canGoForward = sections.indexOf(this.state.placeInFlow) > sectionIndex && this.props.currentSection !== "Send"

    return (
      <div>
        {this.props.currentSection !== "Start" && <Button onClick={this.go.bind(this, sectionIndex-1)}>Back</Button>}
        {canGoForward && <Button onClick={this.go.bind(this, sectionIndex+1)}>Next</Button>}
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
