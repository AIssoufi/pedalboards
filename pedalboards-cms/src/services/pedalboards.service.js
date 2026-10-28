// Helpers
import { RequestHelper } from 'helpers';

// Utils
import { Env } from 'utils';
import { capSearchText } from 'utils/search-text';
import { isUsablePluginId } from './utils';

// Constants
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MISSING_PLUGIN_ID_MESSAGE } from './constants';

class PedalboardService {
  constructor() {
    this.url = Env.get('core_service');
  }

  /**
   * Builds the address of a plugin, its id encoded so that a `/`, `?` or `#` stays in the id.
   * @param {string} id id of the plugin
   * @returns {string} the address of the plugin
   */
  buildPluginUrl(id) {
    return `${this.url}/api/plugin/${encodeURIComponent(id)}`;
  }

  /**
   * Loads a page of every plugin.
   * @param {Object|null} [params]
   * @param {number} [params.page=1] number of the page, from 1
   * @param {number} [params.pageSize=10] number of plugins in a page
   * @returns {Promise<Object>} the page, with its plugins in `data`
   */
  async getPlugins(params) {
    const { page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE } = params || {};
    const url = new URL(`${this.url}/api/plugins`);

    url.searchParams.append('page', page);
    url.searchParams.append('pagesize', pageSize);

    return RequestHelper.get(url);
  }

  /**
   * Loads a page of the plugins that match a search.
   * @param {Object|null} [params]
   * @param {URLSearchParams} [params.searchParams] fields to filter by, as `name=gate`. Without
   * them, every plugin matches
   * @param {number} [params.page=1] number of the page, from 1
   * @param {number} [params.pageSize=10] number of plugins in a page
   * @returns {Promise<Object>} the page, with its plugins in `data`
   */
  async findPlugins(params) {
    const { searchParams, page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE } = params || {};
    const url = new URL(`${this.url}/api/plugins`);

    url.searchParams.append('page', page);
    url.searchParams.append('pagesize', pageSize);

    if (searchParams instanceof URLSearchParams) {
      for (const pair of searchParams.entries()) {
        // The API refuses a text whose LIKE pattern is longer than D1 takes: send its longest start
        url.searchParams.append(`filterby[${pair[0]}]`, capSearchText(pair[1]));
      }
    }

    return RequestHelper.get(url);
  }

  /**
   * Loads a plugin.
   * @param {string} id id of the plugin. Without it, or with `.` or `..`, nothing is sent and the
   * promise rejects
   * @returns {Promise<Object>} the answer of the service, with the plugin in `data`
   */
  async getPlugin(id) {
    if (!isUsablePluginId(id)) throw new Error(MISSING_PLUGIN_ID_MESSAGE);

    const url = this.buildPluginUrl(id);

    return RequestHelper.get(url);
  }

  /**
   * Replaces the fields of a plugin.
   * @param {Object|null} [params]
   * @param {string} [params.id] id of the plugin. Without it, or with `.` or `..`, nothing is sent
   * and the promise rejects
   * @param {FormData} [params.formData] new fields of the plugin
   * @returns {Promise<Object>} the answer of the service, with the plugin in `data`
   */
  async updatePlugin(params) {
    const { id, formData } = params || {};

    if (!isUsablePluginId(id)) throw new Error(MISSING_PLUGIN_ID_MESSAGE);

    const url = this.buildPluginUrl(id);

    return RequestHelper.put({ url, body: formData });
  }

  /**
   * Creates a plugin.
   * @param {FormData} data fields of the new plugin, with its image if any
   * @returns {Promise<Object>} the answer of the service, with the plugin in `data`
   */
  async createPlugin(data) {
    const url = `${this.url}/api/plugin`;

    return RequestHelper.post({ url, body: data });
  }

  /**
   * Deletes a plugin.
   * @param {Object|null} [params]
   * @param {string} [params.id] id of the plugin. Without it, or with `.` or `..`, nothing is sent
   * and the promise rejects
   * @param {number} [params.page=1] page of plugins that the service answers with, from 1
   * @param {number} [params.pageSize=10] number of plugins in that page
   * @returns {Promise<Object>} the answer of the service
   */
  async deletePlugin(params) {
    const { id, page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE } = params || {};

    if (!isUsablePluginId(id)) throw new Error(MISSING_PLUGIN_ID_MESSAGE);

    const url = new URL(this.buildPluginUrl(id));

    url.searchParams.append('page', page);
    url.searchParams.append('pagesize', pageSize);

    return RequestHelper.remove(url);
  }
}

export default new PedalboardService();
