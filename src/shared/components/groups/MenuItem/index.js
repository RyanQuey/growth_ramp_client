import PropTypes from 'prop-types'
import { Link, NavLink, withRouter, Switch, Route } from 'react-router-dom'
//TODO: move MenuItem into groups as well
import classes from './style.scss'

const MenuItem = ({ text, children, link, nav, onClick, location, badge }) => (
  <li className={classes.menuItem} onClick={onClick}>
    {link && nav &&
      <NavLink to={link} activeClassName={classes.navActive}>
        {badge && <span className={classes.badge}>{badge}</span>}
        {text}
      </NavLink>
    }
    {link && !nav &&
      <Link to={link}>
        {badge && <span className={classes.badge}>{badge}</span>}
        {text}
      </Link>
    }
    {!link &&
      <span>
        {badge && <span className={classes.badge}>{badge}</span>}
        {text}
      </span>
    }
    {location.pathname.includes(link) && children}
  </li>
)

MenuItem.propTypes = {
  children: PropTypes.node,
  link: PropTypes.string,
  nav: PropTypes.bool,
}

export default withRouter(MenuItem)
