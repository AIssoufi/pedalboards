// Dependencies
import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';

// CSS
import './style.scss';

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.fromRef = createRef();
  }
  static propTypes = {
    onSubmit: PropTypes.func.isRequired
  }

  handleFormSubmit = event => {
    event.preventDefault();
    const formNode = this.fromRef.current;
    const formData = new FormData(formNode);

    this.props.onSubmit(formData);
  }

  render() {
    return (
      <form
        className="search-container"
        onSubmit={this.handleFormSubmit}
        ref={this.fromRef}>
        <div className="search">
          <input
            type="text"
            name="value"
            placeholder="Search Plugins"
            onChange={_.debounce(this.handleFormSubmit, 900)} />
          <button type="submit"><FontAwesomeIcon icon={faSearch} /></button>
        </div>
        <div className="filter">
          <p>in</p>
          <select name="label" defaultValue="-1">
            <option value="-1">all</option>
            <option value="label">lebel</option>
            <option value="brand">brand</option>
            <option value="categories">categorie</option>
          </select>
        </div>

      </form>
    );
  }
}