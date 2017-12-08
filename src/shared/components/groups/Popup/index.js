import PropTypes from 'prop-types'
import classes from './style.scss'
import { StyleSheet, css } from 'aphrodite'
import { Icon } from 'shared/components/elements'
import theme from 'theme'

const STYLES = {
  primary: {
    regular: {
      background: theme.color.white,
      color: theme.color.black,
      //border: "none",
    },
  },
  inverted: {
    regular: {
      background: theme.color.white,
      color: theme.color.primary,
      //border: `${theme.color.primary} solid 2px`,
    },
  },
}
//takes the style prop and outputs preset popup types
const styles = (style, disabled, selected) => {
  let status = "regular"
  const popupStyle = STYLES[style][status]

  return StyleSheet.create({
    popup: {
      background: popupStyle.background,
      color: popupStyle.color,
      //border-color: popupStyle.borderColor,
    },
  })

}

//use containerClass to define padding etc on container
const Popup = ({ style = 'primary', children, onClick, type, className, body = "left", float = "right", containerClass }) => {

  return (
    <div
      className={`${classes.popup} ${classes[`float-${body}`]}  ${classes[`body-${body}`]} ${className}`}
      onClick={onClick}
    >
      <div className={`${classes.scrim}`}>
        <span className={`${css(styles(style).popup)} ${classes.caret}`}/>
      </div>
      <div className={`${css(styles(style).popup)}  ${classes.container} ${containerClass}`}>
        {children}
      </div>
    </div>
  )
}

Popup.propTypes = {
  onClick: PropTypes.func,
}

export default Popup

