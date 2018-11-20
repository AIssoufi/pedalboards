// Dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons'

// CSS
import './search.scss';

export default class Search extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  }

  handleFormChange = event => {

  }

  handleFormSubmit = event => {
    event.preventDefault();

    const formNode = event.target;
    const formData = new FormData(formNode);

    this.props.onSubmit(formData);
  }

  render() {
    return (
      <form className="search-container" onSubmit={this.handleFormSubmit}>
        <input
          type="text"
          name="search"
          placeholder="Search Plugins"
          onChange={this.handleFormChange} />
        <button type="submit"><FontAwesomeIcon icon={faSearch} /></button>
      </form>
    );
  }
}