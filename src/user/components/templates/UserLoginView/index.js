import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  ModalContainer,
  ModalBody,
  ModalFooter,
} from 'shared/components/partials/Modal'
import { Flexbox } from 'shared/components/elements'
import { Login } from 'shared/components/partials'
import {  } from 'constants/actionTypes'
import classes from './style.scss'

class UserLoginView extends Component {
  constructor(props) {
    super(props)
    this.onSuccess = this.onSuccess.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.changedView = this.changedView.bind(this)

    this.state = {
      view: props.initialView || "LOGIN",
    }
  }
  handleCancel (){
  }

  onSuccess () {
    this.handleCancel();

    if (typeof this.props.onSuccess === 'function') {
      this.props.onSuccess();
    }
  }

  changedView (newView) {

    this.setState({view: newView})
  }

  render (){
    return (
      <div className={`${classes.loginWrapper} ${classes[this.state.view]}`}>
        <div className={classes.container}>
          <Login
            modal={false}
            onSuccess={this.onSuccess}
            onCancel={this.handleCancel}
            initialView={this.props.initialView}
            changedView={this.changedView}
          />
        </div>
      </div>
    )
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
  }
}
const mapStateToProps = (state) => ({
  currentModal: state.viewSettings.currentModal,
  initialView: Helpers.safeDataPath(state, "viewSettings.Login.initialView", ""),
})

export default connect(mapStateToProps, mapDispatchToProps)(UserLoginView)
