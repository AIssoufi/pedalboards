// Helpers
import { RequestHelper } from 'helpers';

// Utils
import { Env } from 'utils';

class PedalboardsService {
  constructor() {
    this.url = Env.get('core_service');
  }

  async getPlugins(page = 1, pagesize = 10) {
    const url = new URL(`${this.url}/api/plugins`);

    url.searchParams.append('page', page);
    url.searchParams.append('pagesize', pagesize);

    return RequestHelper.get(url);
  }

  async findPlugins(searchParams, page = 1, pagesize = 10) {
    const url = new URL(`${this.url}/api/plugins`);
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
    const url = `${this.url}/api/plugin/${id}`;

    return RequestHelper.get(url);
  }

  async updatePlugin(id, data) {
    const url = `${this.url}/api/plugin/${id}`;

    return RequestHelper.put(url, data);
  }

  async createPlugin(data) {
    const url = `${this.url}/api/plugin`;

    return RequestHelper.post(url, data);
  }

  async deletePlugin(id) {
    const url = `${this.url}/api/plugin/${id}`;

    return RequestHelper.remove(url);
  }
}

export default new PedalboardsService();
