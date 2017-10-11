import PropTypes from 'prop-types'
import classes from './Button.scss'
import theme from 'theme'

const Button = ({ background, children, color, border, onClick, hover, disabled, type }) => {
  const bg = (disabled && background == 'primary') ? 'white' : background
  const clr = (disabled && color == 'white') ? 'accent1' : color
  const bdr = (disabled && !border) ? `${theme.color.accent1} 1px solid` : border || 'none'

  /*const styles = StyleSheet.create({
    button: {
      background: theme.color[bg],
      color: theme.color[clr],
      border: bdr,
      ':hover': {
        background: theme.color[hover],
      },
    },
  })*/
  return (
    <button
      className={`${classes.button}`}
      onClick={onClick}
      disabled={(disabled || disabled == 'disabled') ? 'disabled' : false}
      type={type || "button"}
    >
      {children}
    </button>
  )
}

Button.defaultProps = {
  background: 'primary',
  color: 'white',
}

Button.propTypes = {
  background: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  color: PropTypes.string,
  onClick: PropTypes.func,
  hover: PropTypes.string,
  disabled: PropTypes.bool,
  border: PropTypes.string,
}

export default Button

