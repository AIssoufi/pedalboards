import {
	FILTER_PARAMETER_PATTERN,
	MAX_SEARCH_PATTERN_BYTES,
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
 * Builds the LIKE pattern that finds a text anywhere in a field.
 *
 * @param {string} text - Searched text.
 * @returns {string} The escaped text between two `%`.
 * @example
 * createLikePattern('100%'); // '%100\%%'
 */
export const createLikePattern = text => `%${escapeLikePattern(text)}%`;

/** Encoder that counts the UTF-8 bytes of a LIKE pattern, as D1 measures it */
const utf8Encoder = new TextEncoder();

/**
 * Tells whether D1 accepts the LIKE pattern of a searched text.
 *
 * @param {string} text - Searched text.
 * @returns {boolean} True when its pattern holds MAX_SEARCH_PATTERN_BYTES UTF-8 bytes at most.
 */
const isSearchablePattern = text => utf8Encoder.encode(createLikePattern(text)).length <= MAX_SEARCH_PATTERN_BYTES;

/**
 * Reads a searched text from a query parameter.
 *
 * @param {unknown} value - Value of the parameter: a string, an array when repeated, or undefined.
 * @returns {string} The text, empty when the parameter is missing.
 * @throws {InvalidInputError} When the parameter is repeated, or too long for the LIKE pattern
 * that D1 accepts.
 */
export const parseSearchText = value => {
	if (value === undefined) {
		return '';
	}
	const isValidText = typeof value === 'string' && isSearchablePattern(value);
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
	const isSearchableField = Object.hasOwn(PLUGIN_FILTER_CONDITIONS, field);
	if (!isSearchableField) {
		throw new InvalidInputError(`The field "${field}" cannot be searched`);
	}
	const text = parseSearchText(value);
	return text ? { ...filters, [field]: text } : filters;
}, {});
