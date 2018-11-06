

import fakeJsonObjectResponse from './fakePluginsResponse.json';

class PedalboardsService {
  getPlugins() {
    return new Promise(function (resolve, reject) {
      const body = JSON.stringify(fakeJsonObjectResponse);
      const init = { status: 200, statusText: '' }
      const resp = new Response(body, init);
      fakeJsonObjectResponse ? resolve(resp) : reject('Error');
    });
  }
}

export default new PedalboardsService();