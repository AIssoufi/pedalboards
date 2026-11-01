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
 * @returns {{ plugins: Object[], pageCount: number, pluginCount: number }} The plugins, only the
 * objects of `data`, the number of pages, 0 when `numberPages` is not a whole number from 0, and
 * the number of plugins on all the pages, those of `plugins` when `count` is not such a number.
 * @example
 * toPluginsPage({ data: [{ _id: 'abgate' }], count: 12, numberPages: 2 });
 * // { plugins: [{ _id: 'abgate' }], pageCount: 2, pluginCount: 12 }
 */
const toPluginsPage = (answer) => {
  const { data, count, numberPages } = answer ?? {};
  const plugins = Array.isArray(data) ? data.filter(isPlugin) : [];

  return {
    plugins,
    pageCount: isPageCount(numberPages) ? numberPages : 0,
    pluginCount: isPageCount(count) ? count : plugins.length
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
