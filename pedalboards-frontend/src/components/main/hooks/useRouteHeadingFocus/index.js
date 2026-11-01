// Dependencies
import { useEffect, useRef } from 'react';
import { NavigationType, useLocation, useNavigationType } from 'react-router';

// Constants
import { PLUGINS_PATHNAME } from '../../../../constants/routes';

// Utils
import followMainHeading from './followMainHeading';
import followOpenedCard from './followOpenedCard';

/**
 * Moves the focus to the main heading after a route change, since a single-page app reloads
 * nothing, so that the browser announces nothing by itself. A change of the query string alone
 * stays on the page, and moves nothing. Neither does the first address, nor its redirect: a page
 * that has just loaded keeps the focus of the browser. Going back or forward keeps the scroll
 * position that the browser restores. Coming back to the entry of the list that opened a plugin
 * gives the focus to the link of that card, not to the heading, so that the next Tab goes on from
 * it: each entry remembers the entry it opened, and coming from that one tells Back from Forward.
 * A jump of several entries comes from another one and focuses the heading, and a reload of the
 * tab forgets what was opened. While a page loads, it watches the page for its next heading, until
 * the next change of the address or the unmount. Must be called inside a router.
 *
 * @param {Object} params
 * @param {{ current: Element|null }} params.containerRef - Element holding the pages.
 * @example
 * useRouteHeadingFocus({ containerRef: mainRef });
 */
const useRouteHeadingFocus = ({ containerRef }) => {
  const { key, pathname } = useLocation();
  const navigationType = useNavigationType();
  const lastPathnameRef = useRef(pathname);
  const lastKeyRef = useRef(key);
  const hasNavigatedRef = useRef(false);
  // Entry that each entry of the history opened last, by the key of the one that opened it
  const openedEntriesRef = useRef(new Map());

  useEffect(() => {
    const isSameRoute = pathname === lastPathnameRef.current;
    const lastKey = lastKeyRef.current;

    lastPathnameRef.current = pathname;
    lastKeyRef.current = key;
    if (isSameRoute) return undefined;

    // Only a redirect replaces a route: the one of the first address is no change for the visitor
    const isRedirect = navigationType === NavigationType.Replace;

    if (!isRedirect) hasNavigatedRef.current = true;
    if (!hasNavigatedRef.current) return undefined;

    if (navigationType === NavigationType.Push) {
      openedEntriesRef.current.set(lastKey, { key, pathname });
    }

    const isHistoryMove = navigationType === NavigationType.Pop;
    const openedEntry = isHistoryMove ? openedEntriesRef.current.get(key) : undefined;
    const isBackFromOpenedEntry = openedEntry?.key === lastKey;
    const isBackToList = pathname === PLUGINS_PATHNAME && isBackFromOpenedEntry;

    if (isBackToList) {
      return followOpenedCard({ container: containerRef.current, pathname: openedEntry.pathname });
    }

    return followMainHeading({ container: containerRef.current, preventScroll: isHistoryMove });
  }, [key, pathname, navigationType, containerRef]);
};

export default useRouteHeadingFocus;
