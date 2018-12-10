// Components
import React, { Component } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faThList } from '@fortawesome/free-solid-svg-icons';

// CSS
import './style.scss';

export default class Header extends Component {
  render() {
    return (
      <nav className="toolbar whiteframe">
        <div className="toolbar-content">
          <Link to="/" className="mobile-menu-button">
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </Link>
          <div className="toolbar-brand-container">
            <div className="toolbar-brand">
              <Link className="logo" to="/">
                Projet MBDS
              </Link>
            </div>
          </div>
          <div className="toolbar-option-container">
            <NavLink
              className="toolbar-option"
              activeClassName="active"
              to="/plugins">
              <FontAwesomeIcon icon={faThList} />
              <span>Plugins</span>
            </NavLink>
            <NavLink
              className="toolbar-option"
              to={process.env.REACT_APP_BACKEND + "/login"}
              target="_blank">
              <FontAwesomeIcon icon={faUser} />
              <span>Log In</span>
            </NavLink>

          </div>
        </div>
      </nav>
    )
  }
}