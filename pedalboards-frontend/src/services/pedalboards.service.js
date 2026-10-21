// Helpers
import { RequestHelper } from '../helpers';

// Utils
import { Env } from '../utils';

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

  async getPlugins(page = 1, pagesize = 10) {
    const url = new URL(`${this.url}/api/plugins`, window.location.origin);

    url.searchParams.append('page', page);
    url.searchParams.append('pagesize', pagesize);

    return RequestHelper.get(url);
  }

  async findPlugins(searchParams, page = 1, pagesize = 10) {
    const url = new URL(`${this.url}/api/plugins`, window.location.origin);
    url.searchParams.append('page', page);
    url.searchParams.append('pagesize', pagesize);

    if (searchParams instanceof URLSearchParams) {
      for (const pair of searchParams.entries()) {
        url.searchParams.append(`filterby[${pair[0]}]`, pair[1]);
      }
    }

    return RequestHelper.get(url);
  }

  async getPlugin(id) {
    return RequestHelper.get(this.pluginUrl(id));
  }

  async updatePlugin(id, data) {
    return RequestHelper.put({ url: this.pluginUrl(id), body: data });
  }

  async createPlugin(data) {
    const url = `${this.url}/api/plugin`;

    return RequestHelper.post({ url, body: data });
  }

  async deletePlugin(id) {
    return RequestHelper.remove(this.pluginUrl(id));
  }
}

export default new PedalboardsService();
