import PropTypes from 'prop-types'
import { Link, NavLink, withRouter, Switch, Route } from 'react-router-dom'
//TODO: move MenuItem into groups as well
import classes from './style.scss'

const MenuItem = ({ text, children, link, nav, onClick, location }) => (
  <li className={classes.menuItem} onClick={onClick}>
    {link && nav &&
      <NavLink to={link} activeClassName={classes.navActive}>
        {text}
      </NavLink>
    }
    {link && !nav &&
      <Link to={link}>
        {text}
      </Link>
    }
    {!link &&
      <span>
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
