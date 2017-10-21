import PropTypes from 'prop-types'
import { Link, NavLink, withRouter } from 'react-router-dom'
import classes from './style.scss'

const MenuChild = ({ text, children, link, nav, badge, onClick }) => (
  <li className={classes.menuChild} onClick={onClick} >
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
  </li>
)

MenuChild.propTypes = {
  children: PropTypes.node,
  link: PropTypes.string,
  nav: PropTypes.bool,
}

export default withRouter(MenuChild)
