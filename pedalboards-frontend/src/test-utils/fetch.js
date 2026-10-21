// Range of the statuses that fetch reports as ok, the first one being the default status
const FIRST_OK_STATUS = 200;
const LAST_OK_STATUS = 299;

/**
 * Builds the answer of a fetch with a JSON body, as the request helper reads it.
 *
 * @param {Object} [params]
 * @param {*} [params.body] - Body of the answer, returned by its `json` method.
 * @param {number} [params.status] - HTTP status of the answer. @default 200
 * @returns {{ ok: boolean, status: number, json: Function }} The answer.
 * @example
 * vi.spyOn(window, 'fetch').mockResolvedValue(jsonResponse({ body: { data: [] } }));
 */
const jsonResponse = ({ body, status = FIRST_OK_STATUS } = {}) => ({
  ok: status >= FIRST_OK_STATUS && status <= LAST_OK_STATUS,
  status,
  json: () => Promise.resolve(body)
});

export { jsonResponse };
