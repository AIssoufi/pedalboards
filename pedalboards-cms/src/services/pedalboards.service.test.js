// Services
import PedalboardService from './pedalboards.service';

// Address of the core service in `.env.test`
const SERVICE_URL = 'http://localhost:8080';

// Address of the first page of 10 plugins, unfiltered
const FIRST_PAGE_URL = `${SERVICE_URL}/api/plugins?page=1&pagesize=10`;

const MISSING_ID_MESSAGE = 'Le plugin n\'a pas d\'identifiant';

// Id holding the characters that would change the path, the query or the fragment of an address
const RESERVED_ID = 'gate/v2?mode=fast#top';

// Address of the plugin of that id, the id encoded
const RESERVED_ID_URL = `${SERVICE_URL}/api/plugin/gate%2Fv2%3Fmode%3Dfast%23top`;

// Address and options of the only request sent, the address as a text
const readSentRequest = () => {
  const [[url, options]] = global.fetch.mock.calls;

  return { url: String(url), options };
};

// Addresses of every request sent, as texts
const readSentUrls = () => global.fetch.mock.calls.map(([url]) => String(url));

describe('PedalboardService', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] })
    });
  });

  afterEach(() => {
    delete global.fetch;
  });

  describe('getPlugins', () => {
    it('loads the page of the given size', async () => {
      await PedalboardService.getPlugins({ page: 2, pageSize: 5 });

      expect(readSentRequest()).toEqual({
        url: `${SERVICE_URL}/api/plugins?page=2&pagesize=5`,
        options: undefined
      });
    });

    it('loads the first page of 10 plugins without any params or with null', async () => {
      await PedalboardService.getPlugins();
      await PedalboardService.getPlugins(null);

      expect(readSentUrls()).toEqual([FIRST_PAGE_URL, FIRST_PAGE_URL]);
    });

    it('keeps the default size when only the page is given', async () => {
      await PedalboardService.getPlugins({ page: 3 });

      expect(readSentRequest().url).toBe(`${SERVICE_URL}/api/plugins?page=3&pagesize=10`);
    });
  });

  describe('findPlugins', () => {
    it('filters the page by each field of the search', async () => {
      const searchParams = new URLSearchParams('name=gate&categories=Dynamics');

      await PedalboardService.findPlugins({ searchParams, page: 2, pageSize: 5 });

      const url = new URL(readSentRequest().url);

      expect(Array.from(url.searchParams.entries())).toEqual([
        ['page', '2'],
        ['pagesize', '5'],
        ['filterby[name]', 'gate'],
        ['filterby[categories]', 'Dynamics']
      ]);
    });

    it('loads the first page of 10 plugins, unfiltered, without params or with null', async () => {
      await PedalboardService.findPlugins();
      await PedalboardService.findPlugins(null);

      expect(readSentUrls()).toEqual([FIRST_PAGE_URL, FIRST_PAGE_URL]);
    });

    it('ignores a search that is not a URLSearchParams', async () => {
      await PedalboardService.findPlugins({ searchParams: 'name=gate', page: 1 });

      expect(readSentRequest().url).toBe(FIRST_PAGE_URL);
    });
  });

  describe('getPlugin', () => {
    it('loads the plugin from its address', async () => {
      await PedalboardService.getPlugin('gate');

      expect(readSentRequest()).toEqual({
        url: `${SERVICE_URL}/api/plugin/gate`,
        options: undefined
      });
    });

    it('encodes the id in the address of the plugin', async () => {
      await PedalboardService.getPlugin(RESERVED_ID);

      expect(readSentRequest().url).toBe(RESERVED_ID_URL);
    });

    it('rejects a plugin without an id, and sends nothing', async () => {
      const loads = [
        PedalboardService.getPlugin(),
        PedalboardService.getPlugin(''),
        PedalboardService.getPlugin(null),
        PedalboardService.getPlugin(42)
      ];
      const errors = await Promise.all(loads.map(load => load.catch(caught => caught)));

      expect(errors.map(error => error.message)).toEqual(loads.map(() => MISSING_ID_MESSAGE));
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('updatePlugin', () => {
    it('puts the form to the address of the plugin', async () => {
      const formData = new FormData();

      await PedalboardService.updatePlugin({ id: 'gate', formData });

      expect(readSentRequest()).toEqual({
        url: `${SERVICE_URL}/api/plugin/gate`,
        options: { method: 'PUT', body: formData }
      });
    });

    it('encodes the id in the address of the plugin', async () => {
      await PedalboardService.updatePlugin({ id: RESERVED_ID, formData: new FormData() });

      expect(readSentRequest().url).toBe(RESERVED_ID_URL);
    });

    it('rejects a plugin without an id, and sends nothing', async () => {
      const updates = [
        PedalboardService.updatePlugin(),
        PedalboardService.updatePlugin(null),
        PedalboardService.updatePlugin({ formData: new FormData() }),
        PedalboardService.updatePlugin({ id: '', formData: new FormData() }),
        PedalboardService.updatePlugin({ id: null })
      ];
      const errors = await Promise.all(updates.map(update => update.catch(caught => caught)));

      expect(errors.map(error => error.message)).toEqual(updates.map(() => MISSING_ID_MESSAGE));
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('createPlugin', () => {
    it('posts the form to the plugins', async () => {
      const formData = new FormData();

      await PedalboardService.createPlugin(formData);

      expect(readSentRequest()).toEqual({
        url: `${SERVICE_URL}/api/plugin`,
        options: { method: 'POST', body: formData }
      });
    });
  });

  describe('deletePlugin', () => {
    it('deletes the plugin and asks for the page of the given size', async () => {
      await PedalboardService.deletePlugin({ id: 'gate', page: 2, pageSize: 5 });

      expect(readSentRequest()).toEqual({
        url: `${SERVICE_URL}/api/plugin/gate?page=2&pagesize=5`,
        options: { method: 'DELETE' }
      });
    });

    it('asks for the first page of 10 plugins without a page', async () => {
      await PedalboardService.deletePlugin({ id: 'gate' });

      expect(readSentRequest().url).toBe(`${SERVICE_URL}/api/plugin/gate?page=1&pagesize=10`);
    });

    it('encodes the id in the address of the plugin and keeps the page in the query', async () => {
      await PedalboardService.deletePlugin({ id: RESERVED_ID, page: 2, pageSize: 5 });

      expect(readSentRequest().url).toBe(`${RESERVED_ID_URL}?page=2&pagesize=5`);
    });

    it('rejects a plugin without an id, and sends nothing', async () => {
      const deletes = [
        PedalboardService.deletePlugin(),
        PedalboardService.deletePlugin(null),
        PedalboardService.deletePlugin({ page: 2 }),
        PedalboardService.deletePlugin({ id: '' }),
        PedalboardService.deletePlugin({ id: 42 })
      ];
      const errors = await Promise.all(deletes.map(sent => sent.catch(caught => caught)));

      expect(errors.map(error => error.message)).toEqual(deletes.map(() => MISSING_ID_MESSAGE));
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
