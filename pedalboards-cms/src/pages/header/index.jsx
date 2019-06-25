// Dependencies
import React from 'react';
import { NavLink } from 'react-router-dom';

// Style
import './style.scss';

const Header = () => (
  <header className="header-container">
    <img src="https://randomuser.me/api/portraits/men/89.jpg" alt="user" />
    <p>Michel Buffa</p>
    <button type="button" className="btn">Se déconnecter</button>
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
        Add plugn
      </NavLink>
    </nav>
  </header>
);

export default Header;
