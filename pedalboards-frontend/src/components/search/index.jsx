// Dependencies
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tippy';
import _ from 'lodash';

// Style
import './style.scss';
import 'react-tippy/dist/tippy.css';

const Search = ({ onSubmit }) => {
  const formElement = useRef(null);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formNode = formElement.current;
    const formData = new FormData(formNode);

    onSubmit(formData);
  };

  return (
    <form
      className="search-container"
      onSubmit={handleFormSubmit}
      ref={formElement}
    >
      <div className="search">
        <input
          type="text"
          name="value"
          placeholder="Search Plugins"
          onChange={_.debounce(handleFormSubmit, 900)}
        />
        <Tooltip
          title={'<i>Click to launch the search</i>'}
          position="top"
        >
          <button type="submit"><FontAwesomeIcon icon={faSearch} /></button>
        </Tooltip>
      </div>
      <div className="filter">
        <label htmlFor="options">in</label>
        <Tooltip
          title={'<i>Choose a search filter</i>'}
          position="bottom"
          id="options"
        >
          <select name="label" defaultValue="brand" onBlur={handleFormSubmit}>
            <option value="brand">brand</option>
            <option value="categories">categorie</option>
            <option value="label">lebel</option>
          </select>
        </Tooltip>
      </div>

    </form>
  );
};

Search.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default Search;
