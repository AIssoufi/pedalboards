// Constants
import { MAIN_HEADING_SELECTOR } from '../../constants';

// Utils
import { isFocusLost } from '../../utils';

/**
 * Finds the link that opened a page, compared on its attribute since `href` the property is
 * absolute, and looked for among the links since a selector would have to escape the path.
 *
 * @param {Object} params
 * @param {Element} params.container - Element holding the list.
 * @param {string} params.pathname - Path of the page that the link opens.
 * @returns {HTMLAnchorElement|undefined} The link, undefined when the list no longer shows it.
 */
const findLinkTo = ({ container, pathname }) => (
  Array.from(container.querySelectorAll('a')).find(
    link => link.getAttribute('href') === pathname
  )
);

/**
 * Gives the focus back to the link of the card that was opened, or to the main heading while the
 * list does not show it. The list changes after a visitor comes back, when a reload removes the
 * card or when a list that the store no longer held arrives, so the focus follows until the visitor
 * moves it or the caller stops: a focus on anything else, or on nothing while the element is still
 * in the page, comes from the visitor. Nothing scrolls, so that the restored place stays, but for
 * a card that arrives late: the browser had no list to restore a place in, and it would be focused
 * out of sight.
 *
 * @param {Object} params
 * @param {Element} params.container - Element holding the list.
 * @param {string} params.pathname - Path of the page that the card opened.
 * @returns {Function} Stops following.
 * @example
 * const stopFollowing = followOpenedCard({ container: main, pathname: '/plugin/abgate' });
 */
const followOpenedCard = ({ container, pathname }) => {
  const findHeading = () => container.querySelector(MAIN_HEADING_SELECTOR);
  let focused = findLinkTo({ container, pathname }) ?? findHeading();

  focused?.focus({ preventScroll: true });

  const observer = new MutationObserver(() => {
    const isFocusKept = document.activeElement === focused;
    const isFocusRemoved = !focused?.isConnected && isFocusLost();

    if (!isFocusKept && !isFocusRemoved) {
      observer.disconnect();
      return;
    }

    const cardLink = findLinkTo({ container, pathname });
    const isLateCard = cardLink !== undefined && cardLink !== focused;

    focused = cardLink ?? findHeading();
    focused?.focus({ preventScroll: !isLateCard });
  });

  observer.observe(container, { childList: true, subtree: true });

  return () => observer.disconnect();
};

export default followOpenedCard;
