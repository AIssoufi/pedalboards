// Dependencies
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';

// Components
import Tooltip from '../tooltip';

// Constants
import { SEARCH_DEBOUNCE_MS } from './constants';

// Style
import './style.scss';

/**
 * Search form of the plugins: a text field and the field of the plugins it searches in. Calls
 * `onSubmit` with the data of the form on submit, when the select loses the focus, and once the
 * typing in the text field pauses.
 */
const Search = ({ onSubmit }) => {
  const handleFormSubmit = (event) => {
    event.preventDefault();
    // The form on a submit, the form of the field on a change or a blur. Not currentTarget,
    // which React clears before the debounced call of the text field runs
    const formNode = event.target.form ?? event.target;
    const formData = new FormData(formNode);

    onSubmit?.(formData);
  };

  return (
    <form
      className="search-container"
      onSubmit={handleFormSubmit}
    >
      <div className="search">
        <input
          type="text"
          name="value"
          placeholder="Search Plugins"
          onChange={_.debounce(handleFormSubmit, SEARCH_DEBOUNCE_MS)}
        />
        <Tooltip
          content={<i>Click to launch the search</i>}
          placement="top"
        >
          <button type="submit"><FontAwesomeIcon icon={faSearch} /></button>
        </Tooltip>
      </div>
      <div className="filter">
        <label htmlFor="options">in</label>
        <Tooltip
          content={<i>Choose a search filter</i>}
          placement="bottom"
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
  /** Called with the `FormData` of the form, its `value` and `label` fields. */
  onSubmit: PropTypes.func
};

export default Search;
