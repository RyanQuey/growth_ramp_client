import { Component } from 'react';
import { connect } from 'react-redux'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
import { Button } from 'shared/components/elements'

const sections = [
  "Start", //pick plan
  "Channels", //edit plan
  "Compose", //edit post
  "Send"  //send post (and choose to save plan or not

]

class PromoToolFooter extends Component {
  constructor() {
    super()

    this.state = {
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
    //TODO might want to centralize this logic with logic for automatically moving user to place in flow on initial loading somewhere, here or in EditPost
    const currentPost = Helpers.safeDataPath(this.props, "currentPost", {})
    const canGoForward = this.props.currentSection !== "Send" &&
      this.props.currentSection === "Start" && currentPost.planId ||
      (this.props.currentSection === "Channels" && Object.keys(this.props.providerAccounts))

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
    providerAccounts: state.providerAccounts
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const ConnectedFooter = connect(mapStateToProps, mapDispatchToProps)(PromoToolFooter)
export default ConnectedFooter
