import PropTypes from 'prop-types'
import classes from './style.scss'
import { StyleSheet, css } from 'aphrodite'
import theme from 'theme'

const STYLES = {
  primary: {
    regular: {
      background: theme.color.primary,
      color: theme.color.white,
      border: "none",
      hover: "#706497",
    },
    disabled: {
      background: theme.color.darkPurpleGray,
      color: theme.color.white,
      border: "none",
    },
    selected: {
      background: "#706497",
      color: theme.color.white,
      border: "none",
      hover: "#706497",
    },
  },
  inverted: {
    regular: {
      background: theme.color.white,
      color: theme.color.primary,
      border: `${theme.color.primary} solid 2px}`,
      hover: theme.color.lightPurpleComplement,
    },
    disabled: {
      background: theme.color.moduleGrayOne,
      color: theme.color.primary,
      border: `${theme.color.primary} solid 0px}`,
    },
    selected: {
      background: theme.color.lightPurpleComplement,
      color: theme.color.white,
      border: `${theme.color.primary} solid 2px}`,
      hover: theme.color.moduleGrayOne,
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

const Button = ({ style = 'primary', children, onClick, disabled, selected, type }) => {
  disabled = disabled || disabled == 'disabled' ? true : false

  return (
    <button
      className={`${css(styles(style, disabled, selected).button)} ${classes.button} ${disabled ? classes.disabled : ""}`}
      onClick={onClick}
      disabled={disabled}
      type={type || "button"}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  onClick: PropTypes.func,
}

export default Button

