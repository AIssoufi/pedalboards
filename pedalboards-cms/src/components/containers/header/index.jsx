// Dependencies
import React, { Component } from 'react';

// CSS
import './style.scss';

export default class Header extends Component {
  render() {
    return (
      <header className="header-container">
        <img src="https://randomuser.me/api/portraits/men/89.jpg" alt="user" />
        <p>Michel Buffa</p>
        <button type="button" className="btn">Se déconnecter</button>
      </header>
    )
  }
}
