import PropTypes from 'prop-types'
import classes from './style.scss'
import { StyleSheet, css } from 'aphrodite'
import theme from 'theme'

const styles = {
  primary: {
    regular: {
      background: theme.color.primary,
      color: theme.color.white,
      border: "none",
      hover: "#706497",
    },
    disabled: {
      background: theme.color.secondary,
      color: theme.color.white,
      border: "",
      hover: theme.color.secondary,
      cursor: "not-allowed",
    },
  },
  inverted: {
    regular: {
      background: theme.color.white,
      color: theme.color.primary,
      border: `${theme.color.primary} solid 2px}`,
      hover: theme.color.moduleGrayOne,
    },
    disabled: {
      background: theme.color.white,
      color: theme.color.primary,
      border: `${theme.color.primary} solid 2px}`,
      hover: theme.color.secondary,
      cursor: "not-allowed",
    },
  },
}
//takes the style prop and outputs preset button types
const STYLES = (style, disabled) => {
  const buttonStyle = styles[style][disabled ? "disabled" : "regular"]

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

const Button = ({ style = 'primary', children, onClick, disabled, type }) => {
  disabled = disabled || disabled == 'disabled' ? true : false

  return (
    <button
      className={`${css(STYLES(style, disabled).button)} ${classes.button}`}
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

