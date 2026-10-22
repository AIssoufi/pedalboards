// Dependencies
import React from 'react';
import { NavLink } from 'react-router-dom';

// Style
import './style.scss';

/**
 * Bar at the top of every page: the signed-in user, the sign-out button and the links to the
 * pages. The links and the text alternative of the avatar are in English, so they carry their own
 * language inside the French page.
 */
const Header = () => (
  <header className="header-container">
    <img src="https://randomuser.me/api/portraits/men/89.jpg" alt="user" lang="en" />
    <p>Michel Buffa</p>
    <button type="button" className="btn">Se déconnecter</button>
    <nav lang="en">
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
