/**
 * Error of a request that got no usable answer: the network failed, the API answered a status
 * outside 200 to 299, or its body is not JSON.
 */
class RequestError extends Error {
  /**
   * @param {Object} params
   * @param {string} params.message - What went wrong, for the console and the tests.
   * @param {number} [params.status] - HTTP status of the answer, missing when none came.
   * @param {*} [params.cause] - Error that the request threw, such as the TypeError of fetch.
   */
  constructor({ message, status, cause }) {
    super(message, { cause });
    this.name = 'RequestError';
    this.status = status;
  }
}

/**
 * Sends a request and reads its JSON answer.
 *
 * @param {Object} params
 * @param {string|URL} params.url - URL of the request.
 * @param {RequestInit} [params.init] - Method, headers and body of the request.
 * @returns {Promise<*>} The parsed body of a 2xx answer. Rejects with a RequestError when the
 * network fails, the status is not 2xx or the body is not JSON.
 */
const request = async ({ url, init }) => {
  let response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    throw new RequestError({ message: `The request to ${url} failed`, cause: error });
  }

  const isOkAnswer = response?.ok === true;
  if (!isOkAnswer) {
    const status = response?.status;
    throw new RequestError({ message: `The request to ${url} answered ${status}`, status });
  }

  try {
    return await response.json();
  } catch (error) {
    throw new RequestError({
      message: `The answer of ${url} is not JSON`, status: response.status, cause: error
    });
  }
};

const get = url => request({ url });

export {
  RequestError,
  get
};
