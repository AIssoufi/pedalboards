// Utils
import { isPageCount } from '../../utils/page';

/**
 * Tells whether an entry of the answer can be a plugin.
 *
 * @param {*} value - Entry of the `data` list of the answer.
 * @returns {boolean} True for an object that is not null.
 */
const isPlugin = value => typeof value === 'object' && value !== null;

/**
 * Reads a page of plugins from an answer of the API, which may miss fields or hold values of
 * another type.
 *
 * @param {*} answer - Body of the answer, such as `{ data: [...], count: 12, numberPages: 2 }`.
 * @returns {{ plugins: Object[], pageCount: number }} The plugins, only the objects of `data`,
 * and the number of pages, 0 when `numberPages` is not a whole number from 0.
 * @example
 * toPluginsPage({ data: [{ _id: 'abgate' }], numberPages: 1 });
 * // { plugins: [{ _id: 'abgate' }], pageCount: 1 }
 */
const toPluginsPage = (answer) => {
  const { data, numberPages } = answer ?? {};
  const plugins = Array.isArray(data) ? data.filter(isPlugin) : [];

  return {
    plugins,
    pageCount: isPageCount(numberPages) ? numberPages : 0
  };
};

/**
 * Tells whether filters hold at least one field.
 *
 * @param {*} filters - Filters of the plugins page.
 * @returns {boolean} True for URLSearchParams with an entry.
 */
const hasPluginFilters = filters => (
  filters instanceof URLSearchParams && [...filters.keys()].length > 0
);

export { hasPluginFilters, toPluginsPage };
