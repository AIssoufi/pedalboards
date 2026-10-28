// Dependencies
import React from 'react';
import { NavLink } from 'react-router-dom';

// Style
import './style.scss';

// Visible text of the sign-out button
const SIGN_OUT_TEXT = 'Sign out';

/**
 * Bar at the top of every page: the signed-in user, the sign-out button and the links to the
 * pages.
 */
const Header = () => (
  <header className="header-container">
    <img src="https://randomuser.me/api/portraits/men/89.jpg" alt="user" />
    <p>Michel Buffa</p>
    <button type="button" className="btn">{SIGN_OUT_TEXT}</button>
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
