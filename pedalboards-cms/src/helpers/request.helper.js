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
  const hasMessage = Boolean(body) && typeof body.msg === 'string' && body.msg !== '';
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
 * Sends a request to the service. The promise rejects with an Error when the request fails or
 * the response is not a 2xx, so that callers show its message.
 * @param {string|URL} url address of the request
 * @param {RequestInit} [options] method and body. No content type is set: the browser gives
 * the one of a FormData body, with its boundary
 * @returns {Promise<Object>} the JSON body of the response
 */
const request = (url, options) => fetch(url, options)
  .then(handleResponse, handleNetworkError);

const get = url => request(url);

const post = (url, body) => request(url, { method: 'POST', body });

const put = (url, body) => request(url, { method: 'PUT', body });

const remove = url => request(url, { method: 'DELETE' });

/**
 * Gives the message to show for a failed request.
 * @param {Error} [error] error of the request
 * @returns {string} its message, or a generic one when it has none
 * @example
 * readErrorMessage(new Error('Plugin non trouvé')); // 'Plugin non trouvé'
 * readErrorMessage(undefined); // 'La requête a échoué'
 */
const readErrorMessage = (error) => {
  const hasMessage = Boolean(error) && typeof error.message === 'string' && error.message !== '';

  return hasMessage ? error.message : RESPONSE_ERROR_MESSAGE;
};

export {
  get,
  post,
  put,
  readErrorMessage,
  remove
};
