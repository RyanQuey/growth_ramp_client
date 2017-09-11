import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import helpers from '../../helpers'
import { SET_INPUT_VALUE } from '../../actions'
import Input from './input'

class FirebaseInput extends Component {
  constructor(props) {
    super(props)

    this.state = {
      value: props.value,
    }
  }
  updateVal(e, errors, index) {
    const v = e.target.value.toString()
    let value

    // if this is really an array of inputs
    if (index) {
      value = this.state.value
      value[index] = v
    } else {
      value = v
    }
    this.setState({ value })
    let path = this.props.keys.replace(/\./g, "/")
    if (errors.length === 0) {
      this.props.setInputVal({ path, value })
    }
  }

  // if this is really an array of inputs
  addField(e) {
    const c = this
    let value
    if (Array.isArray(c.state.value)) {
      value = this.state.value
    } else if (typeof c.state.value === 'string') {
      value = [this.state.value]
    } else {
      value = [""]
    }

    value.push("")
    this.setState({ value })

    let path = this.props.keys.replace(/\./g, "/")
    this.props.setInputValue({ path, value })
  }

  render() {
    const c = this
//console.log( this.props.value);
    const input = (value, index, label) => (
      <Input
        id={this.props.id}
        className={this.props.className}
        name={this.props.name}
        validations={this.props.validations}
        type={this.props.type || 'text'}
        placeholder={this.props.placeholder}
        value={value}
        checked={this.props.checked}
        onBlur={this.props.onBlur}
        onChange={(e, errors, index) => this.updateVal(e, errors, index)}
        index={index}
        label={label && this.props.label}
        labelAfter={this.props.labelAfter}
        style={this.props.style}
        color={this.props.color}
        key={`${this.props.id} ${index}`}
      />
    )
    const label = this.props.label ? (<label htmlFor={this.props.name}>{this.props.label}</label>) : null

    return (
      <div>
        {(Array.isArray(c.state.value)) ? (
          <div>
            {!this.props.labelAfter && label}
            {this.state.value.map((v, index) => {
              return input(v, index, false)
            })}
            {this.props.labelAfter && label}
          </div>
        ) : (
          input(c.state.value, null, true)
        )}

        {this.props.addFieldButton && (
          <div onClick={(e) => this.addField(e)}>
            {this.props.addFieldButton}
          </div>
        )}
      </div>
    )
  }
}

FirebaseInput.propTypes = {
  uid: PropTypes.string,
  setInputVal: PropTypes.func.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
  onBlur: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  validations: PropTypes.array,
  checked: PropTypes.bool,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  labelAfter: PropTypes.bool,
  keys: PropTypes.string.isRequired,
  color: PropTypes.string,
  style: PropTypes.string,
  addFieldButton: PropTypes.node,
}

const mapStateToProps = (state, ownProps) => {
  //let value = helpers.safeDataPath(state, ownProps.keys, "")

  let obj = {}
  //obj[ownProps.name] = value
  return obj
}
const mapDispatchToProps = (dispatch) => {
  return {
    setInputValue: (payload) => dispatch({type: SET_INPUT_VALUE, payload}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FirebaseInput)

