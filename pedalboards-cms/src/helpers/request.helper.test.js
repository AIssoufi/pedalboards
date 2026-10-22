// Helpers
import {
  get,
  post,
  put,
  readErrorMessage,
  remove
} from './request.helper';

const URL = 'http://localhost:8080/api/plugin/gate';

/**
 * Builds the response that the mocked fetch resolves with.
 * @param {Object} params
 * @param {number} [params.status=200] HTTP status of the response
 * @param {Function} [params.json] reads the body, as Response.json does
 * @returns {Object} the response
 */
const buildResponse = ({ status = 200, json = () => Promise.resolve({}) } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json
});

const respondWith = ({ status, body }) => {
  global.fetch.mockResolvedValue(buildResponse({ status, json: () => Promise.resolve(body) }));
};

describe('RequestHelper', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('gives the body of a successful response', async () => {
    respondWith({ status: 200, body: { msg: 'Details du plugin envoyés', data: { _id: 'gate' } } });

    await expect(get(URL)).resolves.toEqual({
      msg: 'Details du plugin envoyés',
      data: { _id: 'gate' }
    });
  });

  it('gives an empty body when a successful response is not JSON', async () => {
    global.fetch.mockResolvedValue(buildResponse({
      status: 204,
      json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input'))
    }));

    await expect(remove(URL)).resolves.toEqual({});
  });

  it('rejects a non-2xx response with the message of the service and its status', async () => {
    respondWith({ status: 404, body: { msg: 'Plugin non trouvé' } });

    const error = await get(URL).catch(caught => caught);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Plugin non trouvé');
    expect(error.status).toBe(404);
  });

  it('rejects the first status out of the 2xx range', async () => {
    respondWith({ status: 300, body: {} });

    await expect(get(URL)).rejects.toThrow('La requête a échoué (300)');
  });

  it('rejects a non-2xx response without a message with its status', async () => {
    global.fetch.mockResolvedValue(buildResponse({
      status: 502,
      json: () => Promise.reject(new SyntaxError('Unexpected token < in JSON'))
    }));

    await expect(put(URL, new FormData())).rejects.toThrow('La requête a échoué (502)');
  });

  it('ignores a message of the service that is not a text', async () => {
    respondWith({ status: 400, body: { msg: { code: 1 } } });

    await expect(post(URL, new FormData())).rejects.toThrow('La requête a échoué (400)');
  });

  it('rejects a request that never reaches the service', async () => {
    global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await get(URL).catch(caught => caught);

    expect(error.message).toBe('Le service des plugins ne répond pas');
    expect(error.status).toBeUndefined();
  });

  it('lets the browser set the content type of a form', async () => {
    const body = new FormData();

    respondWith({ status: 201, body: {} });
    await post(URL, body);

    expect(global.fetch).toHaveBeenCalledWith(URL, { method: 'POST', body });
  });

  it('sends a put without any header', async () => {
    const body = new FormData();

    respondWith({ status: 200, body: {} });
    await put(URL, body);

    expect(global.fetch).toHaveBeenCalledWith(URL, { method: 'PUT', body });
  });

  it('sends a get without options', async () => {
    respondWith({ status: 200, body: {} });
    await get(URL);

    expect(global.fetch).toHaveBeenCalledWith(URL, undefined);
  });

  it('sends a delete', async () => {
    respondWith({ status: 200, body: {} });
    await remove(URL);

    expect(global.fetch).toHaveBeenCalledWith(URL, { method: 'DELETE' });
  });
});

describe('readErrorMessage', () => {
  it('gives the message of the error', () => {
    expect(readErrorMessage(new Error('Plugin non trouvé'))).toBe('Plugin non trouvé');
  });

  it('gives a generic message for an error without one', () => {
    expect(readErrorMessage(new Error(''))).toBe('La requête a échoué');
    expect(readErrorMessage({ message: 404 })).toBe('La requête a échoué');
  });

  it('gives a generic message without an error', () => {
    expect(readErrorMessage(undefined)).toBe('La requête a échoué');
    expect(readErrorMessage(null)).toBe('La requête a échoué');
  });
});
