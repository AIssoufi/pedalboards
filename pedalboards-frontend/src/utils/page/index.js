// Constants
import { FIRST_PAGE } from './constants';

/**
 * Tells whether a value is a page number: a whole number from the first page.
 *
 * @param {*} value - Value to check.
 * @returns {boolean} True for 1, 2, 3 and so on.
 */
const isPageNumber = value => Number.isInteger(value) && value >= FIRST_PAGE;

/**
 * Tells whether a value can be a number of pages: a whole number from 0, for a list without
 * results.
 *
 * @param {*} value - Value to check, such as the page count of an answer of the API.
 * @returns {boolean} True for 0, 1, 2 and so on.
 */
const isPageCount = value => Number.isInteger(value) && value >= 0;

export { isPageCount, isPageNumber };
