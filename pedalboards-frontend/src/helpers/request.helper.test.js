import { jsonResponse } from '../test-utils/fetch';
import { RequestError, get } from './request.helper';

const URL_OF_TEST = 'http://localhost:8080/api/plugins';
const BODY = { data: [{ _id: 'abgate' }] };
const NOT_FOUND_STATUS = 404;
const SERVER_ERROR_STATUS = 500;

/**
 * Answers the next fetch.
 *
 * @param {Promise} answer - What the fetch gives, a response or a rejection.
 */
const answerFetch = answer => vi.spyOn(window, 'fetch').mockReturnValue(answer);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('get', () => {
  it('resolves the JSON body of a 2xx answer', async () => {
    answerFetch(Promise.resolve(jsonResponse({ body: BODY })));

    await expect(get(URL_OF_TEST)).resolves.toEqual(BODY);
    expect(window.fetch).toHaveBeenCalledWith(URL_OF_TEST, undefined);
  });

  it('rejects with the error of the network', async () => {
    const networkError = new TypeError('Failed to fetch');
    answerFetch(Promise.reject(networkError));

    const error = await get(URL_OF_TEST).catch(caught => caught);

    expect(error).toBeInstanceOf(RequestError);
    expect(error.cause).toBe(networkError);
    expect(error.status).toBeUndefined();
  });

  it.each([NOT_FOUND_STATUS, SERVER_ERROR_STATUS])('rejects an answer of status %i', async (status) => {
    answerFetch(Promise.resolve(jsonResponse({ body: BODY, status })));

    const error = await get(URL_OF_TEST).catch(caught => caught);

    expect(error).toBeInstanceOf(RequestError);
    expect(error.status).toBe(status);
    expect(error.message).toContain(String(status));
  });

  it('rejects a body that is not JSON', async () => {
    const parseError = new SyntaxError('Unexpected token <');
    answerFetch(Promise.resolve({ ok: true, status: 200, json: () => Promise.reject(parseError) }));

    const error = await get(URL_OF_TEST).catch(caught => caught);

    expect(error).toBeInstanceOf(RequestError);
    expect(error.cause).toBe(parseError);
  });

  it.each([
    ['no answer', undefined],
    ['an answer that is not a response', 'oops']
  ])('rejects %s', async (description, answer) => {
    answerFetch(Promise.resolve(answer));

    await expect(get(URL_OF_TEST)).rejects.toBeInstanceOf(RequestError);
  });

  it('never reaches the network when a test does not answer the fetch', async () => {
    await expect(get(URL_OF_TEST)).rejects.toBeInstanceOf(RequestError);
  });
});
