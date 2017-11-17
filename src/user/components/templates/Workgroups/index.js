import { Component } from 'react';
import { connect } from 'react-redux'
import { Button, Flexbox, Input } from 'shared/components/elements'
import { WorkgroupCard } from 'user/components/partials'
import {
  withRouter,
} from 'react-router-dom'
import { FETCH_WORKGROUP_REQUEST, CREATE_WORKGROUP_REQUEST } from 'constants/actionTypes'
import { alertActions } from 'shared/actions'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class Workgroups extends Component {
  constructor() {
    super()

    this.state = {
      name: "",
      creatingGroup: false,
    }

    this.createWorkgroup = this.createWorkgroup.bind(this)
    this.newWorkgroup = this.newWorkgroup.bind(this)
    this.handleName = this.handleName.bind(this)
  }


  componentWillMount() {
    console.log("now fetching posts");
    this.props.fetchWorkgroupRequest({ownerId: this.props.user.id})
  }


  newWorkgroup() {
    this.setState({creatingGroup: true})
  }

  createWorkgroup() {
    /*if (!this.state.name) {
      alertActions({
        title: "Name Required:",
        message: "Please enter a name and try again",
        level: "WARNING",
      })

      return
    }*/
    this.props.createWorkgroupRequest({
      name: this.state.name,
      ownerId: this.props.user.id,
    })
    this.setState({
      creatingGroup: false,
      name: "",
    })
  }

  handleName(value) {
    this.setState({name: value})
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const workgroups = this.props.workgroups || {}

    return (
      <div>
        <div>
          <h1>Workgroups: for 2.0</h1>
          <p>If selected, everything will switch to the workgroup view. Instead of My Posts it will be Workgroup.name Posts, etc</p>
          <p>There will not be a ton of overlap between views. You cannot view workgroup posts, plans, etc until you switch to that workgroup (similar to github)</p>
<p>OTHERWISE very confusing to work out whose is what and so on</p>
<p>Don't want permissions to be too confusing, which is part of why we're doing it this way. Either a group owns a post, or a user does. If a user wants to transfer ownership to the group, fine. If a user wants to copy a plan and let group use it, create a new record, they are now separate plans. Keep it clean</p>
<hr/>
<p>Don't do too much in this particular view. Configuring the workgroup, adding members, etc should require navigating to that workgroup. Will grab the group members, group posts, group plans, etc at that point.</p>
<p>don't have plans that are shared between user and group (?) Just if a group wants that plan, transfer it, or clone it...actually, that's false, might need to be part of several groups</p>
          <Flexbox>
            {Object.keys(workgroups).map((groupId) => {
              const group = workgroups[groupId]

              return (
                <WorkgroupCard
                  key={group.id}
                  workgroup={group}
                />
              )
            })}
          </Flexbox>
          <div>
            {this.state.creatingGroup ? (
              <form onSubmit={this.createWorkgroup}>
                <Input
                  label="Name*"
                  onChange={this.handleName}
                  placeholder="Workgroup name"
                  value={this.state.name}
                  validate={["required"]}
                />
                <Button disabled={!this.state.name} type="submit">Submit</Button>

              </form>
            ) : (
              <Button onClick={this.newWorkgroup}>Create workgroup</Button>
            )}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    workgroups: state.workgroups,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    createWorkgroupRequest: (payload) => dispatch({type: CREATE_WORKGROUP_REQUEST, payload}),
    fetchWorkgroupRequest: (payload) => dispatch({type: FETCH_WORKGROUP_REQUEST, payload})
  }
}

const ConnectedWorkgroups = withRouter(connect(mapStateToProps, mapDispatchToProps)(Workgroups))
export default ConnectedWorkgroups

