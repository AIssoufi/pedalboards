// Utils
import { isNonEmptyText } from 'utils/text';

// Constants
import { DOT_SEGMENTS } from './constants';

/**
 * Tells whether a value can name a plugin in its address: a non-empty text that the URL parser
 * keeps as one path step.
 * @param {*} id value to check
 * @returns {boolean} true for an id that the address keeps as it is once encoded
 * @example
 * isUsablePluginId('gate'); // true
 * isUsablePluginId('..'); // false
 * isUsablePluginId(42); // false
 */
export const isUsablePluginId = id => isNonEmptyText(id) && !DOT_SEGMENTS.includes(id);
