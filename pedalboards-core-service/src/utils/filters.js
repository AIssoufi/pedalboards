import {
	FILTER_PARAMETER_PATTERN,
	MAX_SEARCH_TEXT_LENGTH,
	PLUGIN_FILTER_CONDITIONS
} from '../constants.js';
import { InvalidInputError } from '../errors.js';

/**
 * Escapes the wildcards of a LIKE pattern, so that `%`, `_` and `\` match themselves.
 * The query declares `\` as its escape character (`ESCAPE '\'`).
 *
 * @param {string} text - Searched text.
 * @returns {string} The text, safe to put between the `%` of a LIKE pattern.
 * @example
 * escapeLikePattern('100%_free'); // '100\%\_free'
 */
export const escapeLikePattern = text => text.replace(/[\\%_]/g, '\\$&');

/**
 * Reads a searched text from a query parameter.
 *
 * @param {unknown} value - Value of the parameter: a string, an array when repeated, or undefined.
 * @returns {string} The text, empty when the parameter is missing.
 * @throws {InvalidInputError} When the parameter is repeated or too long.
 */
export const parseSearchText = value => {
	if (value === undefined) {
		return '';
	}
	const isValidText = typeof value === 'string' && value.length <= MAX_SEARCH_TEXT_LENGTH;
	if (!isValidText) {
		throw new InvalidInputError('Invalid searched text');
	}
	return value;
};

/**
 * Reads the `filterby[<field>]=<text>` parameters of a list request. Empty texts are left out.
 *
 * @param {Record<string, unknown>} query - Query of the request.
 * @returns {Record<string, string>} The searched text of each filtered field.
 * @throws {InvalidInputError} When a field cannot be searched, or a text is repeated or too long.
 * @example
 * parseFilters({ 'filterby[brand]': 'mda', 'filterby[label]': '', page: '2' }); // { brand: 'mda' }
 */
export const parseFilters = query => Object.entries(query).reduce((filters, [key, value]) => {
	const match = FILTER_PARAMETER_PATTERN.exec(key);
	if (!match) {
		return filters;
	}
	const field = match[1];
	if (!Object.hasOwn(PLUGIN_FILTER_CONDITIONS, field)) {
		throw new InvalidInputError(`The field "${field}" cannot be searched`);
	}
	const text = parseSearchText(value);
	return text ? { ...filters, [field]: text } : filters;
}, {});
