import PropTypes from 'prop-types'
import classes from './style.scss'
import { StyleSheet, css } from 'aphrodite'
import theme from 'theme'

const Card = ({
  className,
  onClick,
  selected,
  background = 'white',
  color = 'text',
  children,
  hover,
  height = '300px', //defaults to 300px;
}) => {

  const styles = StyleSheet.create({
    card: {
      background: theme.color[background],
      color: theme.color[color],
      height,
      cursor: onClick ? "pointer" : "default",
      ':hover': {
        background: theme.color[hover],
      },
    },
  })
  return (
    <div
      className={`${className} ${css(styles.card)} ${classes.card} ${selected ? classes.selected : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

Card.propTypes = {
  background: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  color: PropTypes.string,
  onClick: PropTypes.func,
  border: PropTypes.string,
}

export default Card

