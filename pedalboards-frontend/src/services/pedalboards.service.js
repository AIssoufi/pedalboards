// Helpers
import { RequestHelper } from '../helpers';

// Utils
import { Env } from '../utils';

// Constants
import { FIRST_PAGE } from '../utils/page/constants';
import { DEFAULT_PAGE_SIZE } from './constants';

/**
 * Client of the API of the core service. Each method rejects with a `RequestError` when the
 * request gets no usable answer (see `helpers/request.helper.js`).
 */
class PedalboardsService {
  constructor() {
    this.url = Env.get('core_service');
  }

  /**
   * Builds the URL of one plugin, with its id encoded so that a `?`, `#` or `/` in it stays in
   * the path segment.
   *
   * @param {string} id - Id of the plugin, such as 'mda-overdrive'.
   * @returns {string} The URL of the plugin in the API.
   */
  pluginUrl(id) {
    return `${this.url}/api/plugin/${encodeURIComponent(id)}`;
  }

  /**
   * Builds the URL of a page of plugins. A missing or null page or page size takes its default.
   *
   * @param {Object} [params]
   * @param {number} [params.page] - Page to read, from 1.
   * @param {number} [params.pageSize] - Number of plugins on each page.
   * @returns {URL} The URL of the page in the API.
   */
  pluginsUrl({ page, pageSize } = {}) {
    const url = new URL(`${this.url}/api/plugins`, window.location.origin);
    url.searchParams.append('page', page ?? FIRST_PAGE);
    url.searchParams.append('pagesize', pageSize ?? DEFAULT_PAGE_SIZE);

    return url;
  }

  /**
   * Reads a page of all the plugins.
   *
   * @param {Object} [params]
   * @param {number} [params.page] - Page to read, from 1.
   * @param {number} [params.pageSize] - Number of plugins on each page.
   * @returns {Promise<*>} The answer of the API.
   */
  async getPlugins({ page, pageSize } = {}) {
    return RequestHelper.get(this.pluginsUrl({ page, pageSize }));
  }

  /**
   * Reads a page of the plugins that match the filters.
   *
   * @param {Object} [params]
   * @param {URLSearchParams} [params.filters] - Fields and values the plugins must match; any
   * other value adds no filter.
   * @param {number} [params.page] - Page to read, from 1.
   * @param {number} [params.pageSize] - Number of plugins on each page.
   * @returns {Promise<*>} The answer of the API.
   */
  async findPlugins({ filters, page, pageSize } = {}) {
    const url = this.pluginsUrl({ page, pageSize });

    if (filters instanceof URLSearchParams) {
      filters.forEach((value, field) => {
        url.searchParams.append(`filterby[${field}]`, value);
      });
    }

    return RequestHelper.get(url);
  }

  async getPlugin(id) {
    return RequestHelper.get(this.pluginUrl(id));
  }
}

export default new PedalboardsService();
