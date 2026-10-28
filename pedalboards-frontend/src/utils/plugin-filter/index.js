// Constants
import { PLUGINS_PATHNAME } from '../../constants/routes';
import { MAX_SEARCH_TEXT_LENGTH } from '../../constants/search';
import { FIRST_PAGE } from '../page/constants';
import {
  HIGH_SURROGATE_MAX, HIGH_SURROGATE_MIN, PAGE_PARAM, PLUGIN_FILTER_FIELDS
} from './constants';

// Utils
import { isPageCount, isPageNumber } from '../page';
import { isNonBlankText } from '../text';

/**
 * Tells whether a field is one the plugins page filters on.
 *
 * @param {*} field - Name of the field, read from a URL or a form.
 * @returns {boolean} True for brand, categories and label.
 */
const isPluginFilterField = field => PLUGIN_FILTER_FIELDS.includes(field);

/**
 * Tells whether a value can filter the plugins, such as a category of a plugin.
 *
 * @param {*} value - Value read from the API, a URL or a form.
 * @returns {boolean} True for a string that is not blank.
 */
const isPluginFilterValue = value => isNonBlankText(value);

/**
 * Tells whether a UTF-16 code unit is the first half of a character written with two, such as
 * an emoji.
 *
 * @param {number} codeUnit - Code unit, as `String.prototype.charCodeAt` gives it.
 * @returns {boolean} True for a high surrogate.
 */
const isHighSurrogate = codeUnit => (
  codeUnit >= HIGH_SURROGATE_MIN && codeUnit <= HIGH_SURROGATE_MAX
);

/**
 * Shortens a searched text to the longest one the API accepts, counted as `String.length`
 * counts it, without cutting a character written with two code units in half.
 *
 * @param {string} text - Searched text.
 * @returns {string} The text, or its first `MAX_SEARCH_TEXT_LENGTH` code units at most.
 */
const capSearchText = (text) => {
  const cappedText = text.slice(0, MAX_SEARCH_TEXT_LENGTH);
  const endsWithHalfCharacter = isHighSurrogate(cappedText.charCodeAt(cappedText.length - 1));

  return endsWithHalfCharacter ? cappedText.slice(0, -1) : cappedText;
};

/**
 * Builds the filters of the plugins page from one field and its value.
 *
 * @param {Object} [params]
 * @param {*} params.field - Field to filter on, such as 'brand'.
 * @param {*} params.value - Value searched in that field. Surrounding spaces are dropped, then
 * the value is cut to `MAX_SEARCH_TEXT_LENGTH`, the longest text the API accepts, and the spaces
 * left at the end of the cut are dropped too.
 * @returns {URLSearchParams} The filter, or no filter when the field is unknown or the value
 * is not a string or is blank.
 */
const createPluginFilters = ({ field, value } = {}) => {
  const filters = new URLSearchParams();
  const isUsableFilter = isPluginFilterField(field) && isPluginFilterValue(value);

  if (isUsableFilter) filters.append(field, capSearchText(value.trim()).trimEnd());

  return filters;
};

/**
 * Builds the query string of the plugins page, with every value encoded.
 *
 * @param {Object} [params]
 * @param {URLSearchParams} [params.filters] - Filters to keep in the URL. A value of another
 * type, such as null, a string or an object, keeps no filter.
 * @param {number} [params.page] - Page to show. The first page, or a value that is not a page
 * number, is omitted.
 * @returns {string} The query string, starting with '?', or '' when there is nothing to keep.
 */
const buildPluginsSearch = ({ filters, page = FIRST_PAGE } = {}) => {
  const isSearchParams = filters instanceof URLSearchParams;
  const searchParams = new URLSearchParams(isSearchParams ? filters : undefined);
  const isLaterPage = isPageNumber(page) && page !== FIRST_PAGE;

  if (isLaterPage) searchParams.set(PAGE_PARAM, page);

  const query = searchParams.toString();

  return query ? `?${query}` : '';
};

/**
 * Builds the location of the plugins page filtered on one value of a field, for a link.
 *
 * @param {Object} params
 * @param {string} params.field - Field to filter on, such as 'brand'.
 * @param {string} params.value - Value of the field, such as 'A&B', encoded in the URL.
 * @returns {{ pathname: string, search: string }} The location, with no filter when the field
 * is unknown or the value blank.
 */
const buildPluginFilterLink = ({ field, value } = {}) => ({
  pathname: PLUGINS_PATHNAME,
  search: buildPluginsSearch({ filters: createPluginFilters({ field, value }) })
});

/**
 * Reads the page number of a query parameter.
 *
 * @param {string|null} value - Value of the page parameter.
 * @returns {number} The page, or the first page when the value is not a whole number from 1.
 */
const parsePage = (value) => {
  const page = Number(value);
  const isValidPageNumber = value !== null && isPageNumber(page);

  return isValidPageNumber ? page : FIRST_PAGE;
};

/**
 * Reads the filters and the page of the plugins page from its query string.
 *
 * @param {string} [search] - Query string of the location, such as '?brand=MDA&page=2'.
 * @returns {{ filters: URLSearchParams, page: number }} The filters on known fields with a
 * value, and the page, the first one when it is missing or invalid.
 */
const parsePluginsSearch = (search) => {
  const searchParams = new URLSearchParams(typeof search === 'string' ? search : '');
  const filters = new URLSearchParams();

  searchParams.forEach((value, field) => {
    createPluginFilters({ field, value }).forEach((filterValue, filterField) => {
      filters.append(filterField, filterValue);
    });
  });

  return {
    filters,
    page: parsePage(searchParams.get(PAGE_PARAM))
  };
};

/**
 * Gives the field and the value that the search form shows for the filters of the URL: the first
 * filter, since the form searches one field at a time.
 *
 * @param {*} filters - Filters of the plugins page, as `parsePluginsSearch` reads them.
 * @returns {{ field?: string, value?: string }} The field and the value of the first filter, or
 * an empty object without filters.
 * @example
 * getSearchFilter(new URLSearchParams('label=Gx')); // { field: 'label', value: 'Gx' }
 */
const getSearchFilter = (filters) => {
  const isSearchParams = filters instanceof URLSearchParams;
  if (!isSearchParams) return {};

  const [firstFilter] = filters.entries();
  if (!firstFilter) return {};

  const [field, value] = firstFilter;
  return { field, value };
};

/**
 * Tells whether a page can be shown.
 *
 * @param {Object} params
 * @param {*} params.page - Page asked for.
 * @param {number} params.pageCount - Number of pages of the results.
 * @returns {boolean} True for a whole number from the first page to the last one.
 */
const isValidPage = ({ page, pageCount } = {}) => isPageNumber(page) && page <= pageCount;

/**
 * Gives the query string of the last page when the page asked for is past it, so that a URL
 * such as `?page=999`, or a filter that leaves fewer pages, still shows plugins.
 *
 * @param {Object} [params]
 * @param {URLSearchParams} [params.filters] - Filters of the URL, kept in the new query string.
 * @param {number} [params.page] - Page of the URL, as `parsePluginsSearch` reads it.
 * @param {number} [params.pageCount] - Number of pages of the results, 0 when there are none.
 * @returns {string|null} The query string of the last page (the first one for an empty list), or
 * null when the page can be shown or the page or the count is not a number of pages.
 * @example
 * buildLastPageSearch({ filters: new URLSearchParams('brand=MDA'), page: 9, pageCount: 3 });
 * // '?brand=MDA&page=3'
 */
const buildLastPageSearch = ({ filters, page, pageCount } = {}) => {
  const isComparable = isPageNumber(page) && isPageCount(pageCount);
  if (!isComparable) return null;

  const lastPage = Math.max(pageCount, FIRST_PAGE);
  const isPastLastPage = page > lastPage;

  return isPastLastPage ? buildPluginsSearch({ filters, page: lastPage }) : null;
};

export {
  buildLastPageSearch,
  buildPluginFilterLink,
  buildPluginsSearch,
  createPluginFilters,
  getSearchFilter,
  isPluginFilterValue,
  isValidPage,
  parsePluginsSearch
};
