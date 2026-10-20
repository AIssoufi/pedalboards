// Constants
import { FIRST_PAGE } from './constants';

/**
 * Tells whether a value is a page number: a whole number from the first page.
 *
 * @param {*} value - Value to check.
 * @returns {boolean} True for 1, 2, 3 and so on.
 */
const isPageNumber = value => Number.isInteger(value) && value >= FIRST_PAGE;

export { isPageNumber };
