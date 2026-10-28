// Dependencies
import { useId, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

// Components
import Tooltip from '../tooltip';

// Hooks
import useDebouncedCallback from './hooks/useDebouncedCallback';

// Constants
import { MAX_SEARCH_TEXT_LENGTH } from '../../constants/search';
import {
  SEARCH_BUTTON_NAME, SEARCH_DEBOUNCE_MS, SEARCH_FIELD_OPTIONS, SEARCH_TEXT_NAME
} from './constants';

// Utils
import { isTextOfValue, toSearchField, toSearchText } from './utils';

// Style
import './style.scss';

/**
 * Props of {@link Search}.
 *
 * @typedef {Object} SearchProps
 * @property {string} [value=''] - Value of the filter of the URL, shown in the text field.
 * @property {string} [field] - Field of the filter of the URL, shown in the select. Brand when the
 *   select lacks it.
 * @property {(formData: FormData) => void} [onSubmit] - Called with the `FormData` of the form,
 *   its `value` and `label` fields.
 */

/**
 * Search form of the plugins: a text field and the field of the plugins it searches in, which
 * show the filter of the URL (`value` and `field`) and follow it when it changes. Calls
 * `onSubmit` with the data of the form on submit, and once the typing in the text field or the
 * choice of the select pauses.
 *
 * @param {SearchProps} props - Props of the component.
 */
const Search = ({ value, field, onSubmit }) => {
  const formRef = useRef(null);
  const selectId = useId();
  const urlText = toSearchText(value);
  const urlField = toSearchField(field);
  const [text, setText] = useState(urlText);
  const [selectedField, setSelectedField] = useState(urlField);
  // The filter of the URL that the form shows, to tell when the URL shows another one
  const [shownFilter, setShownFilter] = useState({ text: urlText, field: urlField });

  // A filter link or the back button changes the filter of the URL: the form shows it, but keeps
  // the text as typed when it searches the same value, such as with a space at its end
  const hasNewUrlFilter = shownFilter.text !== urlText || shownFilter.field !== urlField;
  if (hasNewUrlFilter) {
    setShownFilter({ text: urlText, field: urlField });
    setSelectedField(urlField);
    if (!isTextOfValue({ text, value: urlText })) setText(urlText);
  }

  // Reads the form when it submits, never an event, which may be gone after the debounce delay
  const submitForm = () => {
    const isSubmittable = formRef.current && typeof onSubmit === 'function';

    if (isSubmittable) onSubmit(new FormData(formRef.current));
  };
  const { run: submitLater, cancel: cancelLaterSubmit } = useDebouncedCallback({
    callback: submitForm,
    delayMs: SEARCH_DEBOUNCE_MS
  });

  const handleFormSubmit = (event) => {
    event.preventDefault();
    // The search runs now, so the pause of the typing has nothing left to submit
    cancelLaterSubmit();
    submitForm();
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
    submitLater();
  };

  const handleFieldChange = (event) => {
    setSelectedField(event.target.value);
    submitLater();
  };

  return (
    <form
      ref={formRef}
      className="search-container"
      onSubmit={handleFormSubmit}
    >
      <div className="search">
        <input
          type="text"
          name="value"
          placeholder={SEARCH_TEXT_NAME}
          aria-label={SEARCH_TEXT_NAME}
          maxLength={MAX_SEARCH_TEXT_LENGTH}
          value={text}
          onChange={handleTextChange}
        />
        <Tooltip
          content={<i>Click to launch the search</i>}
          placement="top"
        >
          <button type="submit" aria-label={SEARCH_BUTTON_NAME}>
            <FontAwesomeIcon icon={faMagnifyingGlass} widthAuto />
          </button>
        </Tooltip>
      </div>
      <div className="filter">
        <label htmlFor={selectId}>in</label>
        <Tooltip
          content={<i>Choose a search filter</i>}
          placement="bottom"
        >
          <select
            id={selectId}
            name="label"
            value={selectedField}
            onChange={handleFieldChange}
          >
            {SEARCH_FIELD_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Tooltip>
      </div>

    </form>
  );
};

export default Search;
