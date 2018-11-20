class PedalboardsService {
  constructor() {
    this.url = "http://localhost:8080";
  }
  getPlugins() {
    return fetch(`${this.url}/api/plugins`);
  }
}

export default new PedalboardsService();