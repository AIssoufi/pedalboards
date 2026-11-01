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

/**
 * Tells whether the focus belongs to nothing, as after the removal of the focused element.
 *
 * @returns {boolean} True when no element but the body has the focus.
 */
const isFocusLost = () => {
  const { activeElement, body } = document;

  return !activeElement || activeElement === body;
};

export { isFinalHeading, isFocusLost };
