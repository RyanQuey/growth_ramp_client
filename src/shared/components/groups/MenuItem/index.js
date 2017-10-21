import PropTypes from 'prop-types'
import { Link, NavLink, withRouter, Switch, Route } from 'react-router-dom'
//TODO: move MenuItem into groups as well
import classes from './style.scss'

const MenuItem = ({ text, children, link, nav, onClick, location, badge }) => (
  <li className={classes.menuItem} onClick={onClick}>
    {link && nav &&
      <NavLink to={link} activeClassName={classes.navActive}>
        {text}
        {badge && <span className={classes.badge}>{badge}</span>}
      </NavLink>
    }
    {link && !nav &&
      <Link to={link}>
        {text}
        {badge && <span className={classes.badge}>{badge}</span>}
      </Link>
    }
    {!link &&
      <span>
        {text}
        {badge && <span className={classes.badge}>{badge}</span>}
      </span>
    }
    {location.pathname.includes(link) && children}
    {badge && <span className={classes.badge}>{badge}</span>}
  </li>
)

MenuItem.propTypes = {
  children: PropTypes.node,
  link: PropTypes.string,
  nav: PropTypes.bool,
}

export default withRouter(MenuItem)
