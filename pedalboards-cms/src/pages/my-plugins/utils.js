// Constants
import { FIRST_PAGE } from './constants';

/**
 * Tells whether a page exists in a list of `pageCount` pages: a whole number from the first page
 * to the last one.
 * @param {Object} [params]
 * @param {number} [params.page] page to check
 * @param {number} [params.pageCount] number of pages of the list
 * @returns {boolean} true for a page of the list, false for any other value
 *
 * @example
 * isPageInRange({ page: 3, pageCount: 3 }); // true
 * isPageInRange({ page: 4, pageCount: 3 }); // false
 */
export const isPageInRange = ({ page, pageCount } = {}) => {
  const isWholePage = Number.isInteger(page);

  return isWholePage && page >= FIRST_PAGE && page <= pageCount;
};
