// Constants
import { NOT_FOUND_STATUS } from './constants';

/**
 * Tells whether the fetch of a plugin failed because the API knows no plugin of that id, so that
 * retrying cannot help, unlike a network error, an error of the server or a chunk that fails to
 * load.
 *
 * @param {*} error - Error that the fetch rejected with, such as a `RequestError`.
 * @returns {boolean} True when the error carries the 404 status, as a number.
 */
const isPluginNotFound = error => error?.status === NOT_FOUND_STATUS;

export { isPluginNotFound };
