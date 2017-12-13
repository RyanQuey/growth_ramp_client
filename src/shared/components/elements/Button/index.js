import PropTypes from 'prop-types'
import classes from './style.scss'
import { StyleSheet, css } from 'aphrodite'
import { Icon } from 'shared/components/elements'
import theme from 'theme'

const STYLES = {
  primary: {
    regular: {
      background: theme.color.primary,
      color: theme.color.white,
      border: "none",
      hover: theme.color.lightPurpleGray,
    },
    disabled: {
      background: theme.color.darkPurpleGray,
      color: theme.color.white,
      border: "none",
    },
    selected: {
      background: theme.color.lightPurpleGray,
      color: theme.color.white,
      border: "none",
      hover: theme.color.lightPurpleGray,
    },
  },
  inverted: {
    regular: {
      background: theme.color.white,
      color: theme.color.primary,
      border: `${theme.color.primary} solid 2px`,
      hover: theme.color.lightPurpleGray,
    },
    disabled: {
      background: theme.color.moduleGrayOne,
      color: theme.color.primary,
      border: `${theme.color.primary} solid 0px`,
    },
    selected: {
      background: theme.color.lightPurpleGray,
      color: theme.color.white,
      border: `${theme.color.primary} solid 2px`,
      hover: theme.color.lightPurpleGray,
    },
  },
  danger: {
    regular: {
      background: theme.color.darkRed,
      color: theme.color.white,
      border: `none`,
      hover: theme.color.danger,
    },
    disabled: {
      background: theme.color.moduleGrayOne,
      border: `none`,
      color: theme.color.primary,
    },
    selected: {
      background: theme.color.danger,
      border: `none`,
      color: theme.color.white,
      hover: theme.color.danger,
    },
  },
}
//takes the style prop and outputs preset button types
const styles = (style, disabled, selected) => {
  let status
  if (selected) {
    status = "selected"
  } else if (disabled) {
    status = "disabled"
  } else {
    status = "regular"
  }

  const buttonStyle = STYLES[style][status]

  return StyleSheet.create({
    button: {
      background: buttonStyle.background,
      color: buttonStyle.color,
      border: buttonStyle.border,
      ':hover': {
        background: buttonStyle.hover
      },
    },
  })

}

const Button = ({ style = 'primary', children, onClick, disabled, selected, type, pending, small, rectangle, className }) => {
  disabled = disabled || disabled == 'disabled' ? true : false

  return (
    <button
      className={`${css(styles(style, disabled, selected).button)} ${classes.button} ${className || ""} ${disabled ? classes.disabled : ""} ${small ? classes.small : ""} ${rectangle ? classes.rectangle : ""}`}
      onClick={onClick}
      disabled={disabled || pending}
      type={type || "button"}
    >
      {!pending ? children : <Icon name="spinner" /> }
    </button>
  )
}

Button.propTypes = {
  onClick: PropTypes.func,
}

export default Button

