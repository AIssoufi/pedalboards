// Constants
import { MAIN_HEADING_SELECTOR } from '../../constants';

// Utils
import { isFinalHeading } from '../../utils';

/**
 * Tells whether the focus belongs to nothing, as after the removal of the focused element.
 *
 * @returns {boolean} True when no element but the body has the focus.
 */
const isFocusLost = () => {
  const { activeElement, body } = document;

  return !activeElement || activeElement === body;
};

/**
 * Moves the focus to the main heading of a new page. A page that is still loading shows a
 * placeholder heading, which unmounts once it has loaded and takes the focus with it: the focus
 * follows to each next heading, until the final one, unless the visitor moved it meanwhile.
 *
 * @param {Object} params
 * @param {Element} params.container - Element holding the page.
 * @param {boolean} params.preventScroll - Keeps the scroll position, which a focus would change.
 * @returns {Function|undefined} Stops following, or nothing when the final heading has the focus.
 * @example
 * const stopFollowing = followMainHeading({ container: main, preventScroll: false });
 */
const followMainHeading = ({ container, preventScroll }) => {
  const findHeading = () => container.querySelector(MAIN_HEADING_SELECTOR);
  const firstHeading = findHeading();

  firstHeading?.focus({ preventScroll });
  if (isFinalHeading(firstHeading)) return undefined;

  const observer = new MutationObserver(() => {
    const heading = findHeading();

    if (isFocusLost()) heading?.focus({ preventScroll });
    if (isFinalHeading(heading)) observer.disconnect();
  });

  observer.observe(container, { childList: true, subtree: true });

  return () => observer.disconnect();
};

export default followMainHeading;
