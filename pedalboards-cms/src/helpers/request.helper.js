// Utils
import { isNonEmptyText } from 'utils/text';

// Constants
import { NETWORK_ERROR_MESSAGE, RESPONSE_ERROR_MESSAGE } from './constants';

/**
 * Reads the JSON body of a response, or an empty object when it has none.
 * @param {Response} response response of the service
 * @returns {Promise<Object>} the body
 */
const readBody = response => response.json().catch(() => ({}));

/**
 * Builds the error of a failed response, with the message that the service gives, if any.
 * @param {Object} params
 * @param {Object} params.body body of the response
 * @param {number} params.status HTTP status of the response
 * @returns {Error} the error, with the status in `status`
 */
const toResponseError = ({ body, status }) => {
  const hasMessage = Boolean(body) && isNonEmptyText(body.msg);
  const message = hasMessage ? body.msg : `${RESPONSE_ERROR_MESSAGE} (${status})`;

  return Object.assign(new Error(message), { status });
};

// Default Handlers

const handleResponse = response => readBody(response).then((body) => {
  if (!response.ok) throw toResponseError({ body, status: response.status });

  return body;
});

const handleNetworkError = () => {
  throw new Error(NETWORK_ERROR_MESSAGE);
};

/**
 * Sends a request to the service. The promise rejects with an Error when the address is missing,
 * the request fails or the response is not a 2xx, so that callers show its message.
 * @param {Object|null} [params]
 * @param {string|URL} [params.url] address of the request
 * @param {RequestInit} [params.options] method and body. No content type is set: the browser
 * gives the one of a FormData body, with its boundary
 * @returns {Promise<Object>} the JSON body of the response
 */
const request = (params) => {
  const { url, options } = params || {};

  // Without an address, fetch would request the page itself, or `undefined` next to it
  if (!url) return Promise.reject(new Error(RESPONSE_ERROR_MESSAGE));

  return fetch(url, options).then(handleResponse, handleNetworkError);
};

/**
 * Reads a resource of the service.
 * @param {string|URL} url address of the resource
 * @returns {Promise<Object>} the JSON body of the response
 */
const get = url => request({ url });

/**
 * Creates a resource of the service.
 * @param {Object|null} [params]
 * @param {string|URL} [params.url] address of the collection
 * @param {FormData} [params.body] fields of the resource
 * @returns {Promise<Object>} the JSON body of the response
 */
const post = (params) => {
  const { url, body } = params || {};

  return request({ url, options: { method: 'POST', body } });
};

/**
 * Replaces a resource of the service.
 * @param {Object|null} [params]
 * @param {string|URL} [params.url] address of the resource
 * @param {FormData} [params.body] new fields of the resource
 * @returns {Promise<Object>} the JSON body of the response
 */
const put = (params) => {
  const { url, body } = params || {};

  return request({ url, options: { method: 'PUT', body } });
};

/**
 * Deletes a resource of the service.
 * @param {string|URL} url address of the resource
 * @returns {Promise<Object>} the JSON body of the response
 */
const remove = url => request({ url, options: { method: 'DELETE' } });

/**
 * Gives the message to show for a failed request.
 * @param {Error} [error] error of the request
 * @returns {string} its message, or a generic one when it has none
 * @example
 * readErrorMessage(new Error('Plugin non trouvé')); // 'Plugin non trouvé'
 * readErrorMessage(undefined); // 'La requête a échoué'
 */
const readErrorMessage = (error) => {
  const hasMessage = Boolean(error) && isNonEmptyText(error.message);

  return hasMessage ? error.message : RESPONSE_ERROR_MESSAGE;
};

export {
  get,
  post,
  put,
  readErrorMessage,
  remove
};
