// Constants
import { GENERIC_SCREENSHOT_ALT } from './constants';

// Utils
import { isNonBlankText } from '../text';

/**
 * Gives the text alternative of the screenshot of a plugin, which names the plugin by its label
 * so that each screenshot, and the link around it, reads differently.
 *
 * @param {*} label - Label of the plugin.
 * @returns {string} "Screenshot of" and the trimmed label, or a generic text when the label is
 *   not a text with a character other than a space.
 * @example
 * toScreenshotAlt('Spice'); // 'Screenshot of Spice'
 * toScreenshotAlt(undefined); // 'Plugin screenshot'
 */
const toScreenshotAlt = (label) => {
  if (!isNonBlankText(label)) return GENERIC_SCREENSHOT_ALT;

  return `Screenshot of ${label.trim()}`;
};

export { toScreenshotAlt };
