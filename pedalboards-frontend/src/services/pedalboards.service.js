class PedalboardsService {
  constructor() {
    this.url = "http://localhost:8080";
    this.header = {
      "Content-Type": "application/json; charset=utf-8",
    }
  }

  async getPlugins(page = 1, pagesize = 10) {
    const url = new URL(`${this.url}/api/plugins`);
    url.searchParams.append("page", page);
    url.searchParams.append("pagesize", pagesize);

    return fetch(url).then(response => response.json());
  }

  async findPlugins(searchParams, page = 1, pagesize = 10) {
    const url = new URL(`${this.url}/api/plugins`);
    url.searchParams.append("page", page);
    url.searchParams.append("pagesize", pagesize);

    if (searchParams instanceof URLSearchParams) {
      for (let pair of searchParams.entries()) {
        console.log(pair);
        url.searchParams.append(`filterby[${pair[0]}]`, pair[1]);
      }
    }

    // for (let params of url.searchParams.entries()) {
    //   console.log(params);
    // }
    return fetch(url).then(response => response.json())
      .then(reponse => {
        console.log(reponse);
        return reponse;
      });
  }

  async getPlugin(id) {
    return fetch(`${this.url}/api/plugin/${id}`)
      .then(response => response.json());
  }

  async updatePlugin(id, data) {
    return fetch(`${this.url}/api/plugin/${id}`, {
      method: "PUT",
      header: this.header,
      body: data
    }).then(response => response.json());
  }

  async createPlugin(data) {
    return fetch(`${this.url}/api/plugin`, {
      method: "POST",
      header: this.header,
      body: data
    }).then(response => response.json());
  }

  async deletePlugin(id) {
    return fetch(`${this.url}/api/plugin/${id}`, {
      method: "DELETE"
    }).then(response => response.json());
  }
}

export default new PedalboardsService();