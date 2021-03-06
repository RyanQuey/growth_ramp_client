import PropTypes from 'prop-types'
import theme from 'theme'
import classes from './style.scss'

const Icon = ({ border, className, color, name, onClick, size, ...props }) => {
  let borderStyle = {}

  if (border) {
    borderStyle = {
      borderRadius: '100%',
      boxShadow: '0 1px 10px rgba(0, 0, 0, 0.46)',
    }
  }
  const style = _.extend(borderStyle, { color: theme.color[color] })
  return (
    <i
      aria-hidden="true"
      className={`fa fa-${name.toLowerCase()} fa-${size} ${className} ${classes.icon} ${name === "spinner" ? "fa-spin" : ""} ${onClick ? classes.clickable : ""}`}
      onClick={onClick}
      style={style}
      {...props}
    />
  )
}

Icon.defaultProps = {
  size: '1x',
}

Icon.propTypes = {
  border: PropTypes.bool,
  className: PropTypes.string,
  color: PropTypes.string,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  size: PropTypes.string,
}

export default Icon
