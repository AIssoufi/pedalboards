// Constants
import { DEFAULT_SEARCH_FIELD, SEARCH_FIELD_OPTIONS } from './constants';

/**
 * Gives the field that the select shows.
 *
 * @param {*} field - Field of the filter of the URL, such as 'label'.
 * @returns {string} The field when the select has its option, DEFAULT_SEARCH_FIELD otherwise.
 */
const toSearchField = (field) => {
  const hasOption = SEARCH_FIELD_OPTIONS.some(option => option.value === field);

  return hasOption ? field : DEFAULT_SEARCH_FIELD;
};

/**
 * Gives the text that the text field shows.
 *
 * @param {*} value - Value of the filter of the URL.
 * @returns {string} The value when it is a string, '' otherwise.
 */
const toSearchText = value => (typeof value === 'string' ? value : '');

/**
 * Tells whether the typed text already searches a value, so that the field keeps it as typed.
 *
 * @param {Object} params
 * @param {string} params.text - Text typed in the field, such as 'Gx '.
 * @param {string} params.value - Value of the filter of the URL, such as 'Gx'.
 * @returns {boolean} True when the text without its surrounding spaces is the value.
 */
const isTextOfValue = ({ text, value }) => text.trim() === value;

export { isTextOfValue, toSearchField, toSearchText };
