import { Component } from 'react'
import theme from 'theme'
import PropTypes from 'prop-types'
import classes from './style.scss'
const urlRegEx = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i
// validations for react-validation

const rules = {
  required: {
    test: (value) => {
      return (value.toString().trim().length > 0)
    },
    hint: () => {
      return 'Required'
    },
  },
  email: {
    test: (value) => {
      const base = value.toString().trim()
      const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

      return re.test(base)
    },
    hint: () => {
      return 'Please check email format'
    },
  },
  newPassword: {
    test: (value) => {
      const base = value.toString().trim()

      return (base.length > 7)
    },
    hint: () => {
      return 'Password needs to be 8 characters or longer'
    },
  },
  url: {
    test: (value) => {
      const base = value.toString().trim()
      const re = urlRegEx
      return re.test(base)
    },
    hint: () => {
      return 'Please check url format (be sure to include "http://" or "https://")'
    },
  },
}

class Input extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.state = {
      errors: [],
    }

    this.validate = this.validate.bind(this)
  }

  handleChange(e) {

    const value = e.target.value
    const c = this
    const errors = _.debounce(c.validate, 500)(value)
    //index in case this is a series of inputs...probably don't want that functionality
    //TODO errors not getting set, presumably because of debounce
    this.props.onChange(value, e, errors, this.props.index)
  }

  validate(value) {
    //TODO use the errors store
    const errors = []
    if (this.props.validations) {
      this.props.validations.forEach((v) => {
        // if current value doesn't pass validation
        if (!rules[v].test(value)) {
          errors.push(v)
        }
      })
      this.setState({ errors })
    }
    //return errors can't get it to return from the debounce for some reason
    if (this.props.handleErrors) {
      this.props.handleErrors(errors, this.props.name)
    }

  }

  render() {
    const label = this.props.label ? (<label htmlFor={this.props.name}>{this.props.label}</label>) : null
    const Tag = this.props.textarea ? 'textarea' : 'input'

    return (
      <div className={this.props.className}>
        {!this.props.labelAfter && label}
        <Tag
          className={
            `input-${this.props.type}
            ${this.props.className || ''}
            ${classes.input}
            ${(this.state.errors.length > 0) && classes.formError}`
          }
          name={this.props.name}
          data-name={this.props.name}
          onBlur={this.props.onBlur}
          onChange={this.handleChange}
          placeholder={this.props.placeholder}
          style={{ border: (
            (this.props.color && this.state.errors.length === 0) && `2px solid ${theme.color[this.props.color]}`
          ) }}
          type={this.props.type}
          value={this.props.value}
          maxLength={this.props.maxLength ? this.props.maxLength.toString() : false}
        />
        {this.props.labelAfter && label}
        <div className={classes.errorMessages}>
          {this.state.errors.map((err) => { return rules[err].hint(this.props.name) }).join('; ')}
        </div>
      </div>
    )
  }
}

Input.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  name: PropTypes.string,
  validations: PropTypes.array,
  overrideValidation: PropTypes.bool,
  type: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  checked: PropTypes.bool,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  labelAfter: PropTypes.bool,
  color: PropTypes.string,
  hint: PropTypes.string,
  index: PropTypes.number,
}

export default Input
