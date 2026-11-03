// Dependencies
import React from 'react';
import { NavLink } from 'react-router-dom';

// Style
import './style.scss';

/**
 * Bar at the top of every page: the links to the pages.
 */
const Header = () => (
  <header className="header-container">
    <nav>
      <NavLink
        to="/plugins"
        className="nav-item"
        activeClassName="active"
      >
        My plugins
      </NavLink>
      <NavLink
        to="/plugin/add"
        className="nav-item"
        activeClassName="active"
      >
        Add plugin
      </NavLink>
    </nav>
  </header>
);

export default Header;
