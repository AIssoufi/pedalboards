// Constants
import { PLACEHOLDER_HEADING_CLASS } from './constants';

/**
 * Tells whether a page shows the heading it will keep, so that nothing is left to wait for.
 *
 * @param {Element|null} heading - Main heading of the page, null when it has none yet.
 * @returns {boolean} True for a heading that no other heading will replace.
 */
const isFinalHeading = heading => (
  heading !== null && !heading.classList.contains(PLACEHOLDER_HEADING_CLASS)
);

export { isFinalHeading };
