// Dependencies
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

// Style
import './style.scss';

export default class Header extends Component {
  render() {
    return (
      <header className="header-container">
        <img src="https://randomuser.me/api/portraits/men/89.jpg" alt="user" />
        <p>Michel Buffa</p>
        <button type="button" className="btn">Se déconnecter</button>
        <nav>
          <NavLink
            to="/plugins"
            className="nav-item"
            activeClassName="active"
          >My plugins</NavLink>
          <NavLink
            to="/plugin/add"
            className="nav-item"
            activeClassName="active"
          >Add plugn</NavLink>
        </nav>
      </header>
    )
  }
}
