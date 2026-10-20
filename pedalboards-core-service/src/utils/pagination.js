import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE,
	MAX_PAGE_SIZE,
	POSITIVE_INTEGER_PATTERN
} from '../constants.js';

/**
 * Reads a positive integer from a query parameter.
 *
 * @param {Object} params
 * @param {unknown} params.value - Value of the parameter: a string, an array when repeated, or undefined.
 * @param {number} params.fallback - Value used when the parameter is not an integer of at least 1.
 * @param {number} params.max - Largest value: a larger one is lowered to it.
 * @returns {number} The integer, between 1 and `max`.
 */
export const parsePositiveInteger = ({ value, fallback, max }) => {
	const isDigitString = typeof value === 'string' && POSITIVE_INTEGER_PATTERN.test(value);
	if (!isDigitString) {
		return fallback;
	}
	const number = Number(value);
	if (number < 1) {
		return fallback;
	}
	return Math.min(number, max);
};

/**
 * Reads the page and the page size of a list request. An invalid value falls back to the default,
 * and a value above the limit is lowered to it, so that a request never fails on its pagination.
 *
 * @param {Record<string, unknown>} query - Query of the request.
 * @returns {{ page: number, pageSize: number }} The page, from 1, and the number of plugins per page.
 * @example
 * parsePagination({ page: '2', pagesize: '500' }); // { page: 2, pageSize: 100 }
 * parsePagination({ page: 'abc' }); // { page: 1, pageSize: 10 }
 */
export const parsePagination = query => ({
	page: parsePositiveInteger({ value: query.page, fallback: DEFAULT_PAGE, max: MAX_PAGE }),
	pageSize: parsePositiveInteger({ value: query.pagesize, fallback: DEFAULT_PAGE_SIZE, max: MAX_PAGE_SIZE })
});

/**
 * Counts the pages of a list.
 *
 * @param {Object} params
 * @param {number} params.count - Number of plugins in the list.
 * @param {number} params.pageSize - Number of plugins per page.
 * @returns {number} The number of pages, 0 for an empty list.
 */
export const countPages = ({ count, pageSize }) => Math.ceil(count / pageSize);
