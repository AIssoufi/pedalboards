// Components
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faThList } from '@fortawesome/free-solid-svg-icons';

// Style
import './style.scss';

const Header = () => (
  <nav className="toolbar whiteframe">
    <div className="toolbar-content">
      <Link to="/" className="mobile-menu-button">
        <span className="icon-bar" />
        <span className="icon-bar" />
        <span className="icon-bar" />
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
          to="/plugins"
        >
          <FontAwesomeIcon icon={faThList} />
          <span>Plugins</span>
        </NavLink>
        <a
          className="toolbar-option"
          href={`${process.env.REACT_APP_BACKEND}/login`}
          rel="noopener noreferrer"
          target="_blank"
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Log In</span>
        </a>
      </div>
    </div>
  </nav>
);

export default Header;
