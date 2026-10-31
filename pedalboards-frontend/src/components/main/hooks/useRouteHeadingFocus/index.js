// Dependencies
import { useEffect, useRef } from 'react';
import { NavigationType, useLocation, useNavigationType } from 'react-router';

// Utils
import followMainHeading from './followMainHeading';

/**
 * Moves the focus to the main heading after a route change, since a single-page app reloads
 * nothing, so that the browser announces nothing by itself. A change of the query string alone
 * stays on the page, and moves nothing. Neither does the first address, nor its redirect: a page
 * that has just loaded keeps the focus of the browser. Going back or forward keeps the scroll
 * position that the browser restores. While a page loads, it watches the page for its next
 * heading, until the next route change or the unmount. Must be called inside a router.
 *
 * @param {Object} params
 * @param {{ current: Element|null }} params.containerRef - Element holding the pages.
 * @example
 * useRouteHeadingFocus({ containerRef: mainRef });
 */
const useRouteHeadingFocus = ({ containerRef }) => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const lastPathnameRef = useRef(pathname);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    const isSameRoute = pathname === lastPathnameRef.current;

    lastPathnameRef.current = pathname;
    if (isSameRoute) return undefined;

    // Only a redirect replaces a route: the one of the first address is no change for the visitor
    const isRedirect = navigationType === NavigationType.Replace;

    if (!isRedirect) hasNavigatedRef.current = true;
    if (!hasNavigatedRef.current) return undefined;

    return followMainHeading({
      container: containerRef.current,
      preventScroll: navigationType === NavigationType.Pop
    });
  }, [pathname, navigationType, containerRef]);
};

export default useRouteHeadingFocus;
