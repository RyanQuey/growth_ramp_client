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
  const headerLine = title || subtitle
  const styles = StyleSheet.create({
    card: {
      'border-bottom': headerLine ? `1px solid ${theme.color.moduleGrayOne}` : "",
      'padding-bottom': headerLine ? "20px" : "",
    },
  })
  return (
    <div
      className={`${className} ${classes.cardHeader} ${styles.card}`}
    >
      {headerImgUrl && <img className={classes.headerImg} src={headerImgUrl} />}
      <h2>{title}</h2>
      <div>{subtitle}</div>
    </div>
  )
}

export default CardHeader

