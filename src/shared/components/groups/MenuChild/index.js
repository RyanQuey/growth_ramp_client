import PropTypes from 'prop-types'
import { Link, NavLink, withRouter } from 'react-router-dom'
import classes from './style.scss'

const MenuChild = ({ text, children, link, nav }) => (
  <li className={classes.menuChild}>
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
  </li>
)

MenuChild.propTypes = {
  children: PropTypes.node,
  link: PropTypes.string,
  nav: PropTypes.bool,
}

export default withRouter(MenuChild)
