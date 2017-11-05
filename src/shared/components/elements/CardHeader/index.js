import PropTypes from 'prop-types'
import classes from './style.scss'
import { StyleSheet, css } from 'aphrodite'
import theme from 'theme'

const CardHeader = ({
  className,
  headerImgUrl,
  title,
  subtitle,
}) => {

  return (
    <div
      className={`${className} ${classes.cardHeader}`}
    >
      {headerImgUrl && <img className={classes.headerImg} src={headerImgUrl} />}
      <h3>{title}</h3>
      <div>{subtitle}</div>
    </div>
  )
}

export default CardHeader

