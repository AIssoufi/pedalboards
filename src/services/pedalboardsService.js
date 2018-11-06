

import fakeResponse from './fakePluginsResponse.json';

class PedalboardsService {
  getPlugins() {
    return new Promise(function(resolve, reject){
      fakeResponse ? resolve(fakeResponse) : reject('Error');
    });
  }
}

export default new PedalboardsService();