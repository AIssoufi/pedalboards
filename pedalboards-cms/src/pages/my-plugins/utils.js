// Constants
import { FIRST_PAGE, NEW_TAB_NOTE, UNKNOWN_PAGE_COUNT } from './constants';

/**
 * Reads the number of pages that an answer of the list gives: a whole number of zero or more,
 * otherwise an unknown count.
 * @param {*} numberPages number of pages given by the answer
 * @returns {number} the number of pages, or `UNKNOWN_PAGE_COUNT` for any other value
 *
 * @example
 * readPageCount(3); // 3
 * readPageCount('3'); // 0
 */
export const readPageCount = (numberPages) => {
  const isPageCount = Number.isInteger(numberPages) && numberPages >= UNKNOWN_PAGE_COUNT;

  return isPageCount ? numberPages : UNKNOWN_PAGE_COUNT;
};

/**
 * Reads the page that an answer of the list says it loaded: a whole number from the first page,
 * otherwise the page that was asked for.
 * @param {Object} [params]
 * @param {*} [params.loadedPage] page given by the answer
 * @param {number} [params.page] page that was asked for
 * @returns {number} the loaded page, or the page asked for when the answer gives no page
 *
 * @example
 * readLoadedPage({ loadedPage: 2, page: 3 }); // 2
 * readLoadedPage({ loadedPage: null, page: 3 }); // 3
 */
export const readLoadedPage = ({ loadedPage, page } = {}) => {
  const isPage = Number.isInteger(loadedPage) && loadedPage >= FIRST_PAGE;

  return isPage ? loadedPage : page;
};

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

/**
 * Gives the accessible name of an action on a plugin of the list, so that each "Voir", "Éditer" or
 * "Supprimer" tells which plugin it acts on. It starts with the visible text of the action.
 * @param {Object} [params]
 * @param {string} [params.action=''] visible text of the action
 * @param {*} [params.pluginName] name of the plugin
 * @param {boolean} [params.opensInNewTab=false] whether the action opens a new tab, which the
 *   name then says
 * @returns {string} the action and the trimmed name, or the action alone when the name is not a
 *   text with a character other than a space, followed by `NEW_TAB_NOTE` for a new tab; the
 *   missing parts are left out with their space
 *
 * @example
 * toPluginActionLabel({ action: 'Éditer', pluginName: 'Gate' }); // 'Éditer Gate'
 * toPluginActionLabel({ action: 'Éditer' }); // 'Éditer'
 * toPluginActionLabel({ action: 'Voir', pluginName: 'Gate', opensInNewTab: true });
 * // 'Voir Gate (nouvel onglet)'
 */
export const toPluginActionLabel = ({ action = '', pluginName, opensInNewTab = false } = {}) => {
  const trimmedName = typeof pluginName === 'string' ? pluginName.trim() : '';
  const newTabNote = opensInNewTab ? NEW_TAB_NOTE : '';

  // Leaves the missing parts out, so that no space stands for them
  return [action, trimmedName, newTabNote].filter(Boolean).join(' ');
};
