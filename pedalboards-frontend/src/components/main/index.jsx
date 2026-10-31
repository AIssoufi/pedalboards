// Dependencies
import { useRef } from 'react';

// Hooks
import useRouteHeadingFocus from './hooks/useRouteHeadingFocus';

// Style
import './style.scss';

/**
 * Props of {@link Main}.
 *
 * @typedef {Object} MainProps
 * @property {import('react').ReactNode} [children] - The routes of the app.
 */

/**
 * Main area of the app, which holds the routes and moves the focus to the main heading of each
 * new page. Must be rendered inside a router. Each heading it focuses needs `tabIndex={-1}`.
 *
 * @param {MainProps} props
 */
const Main = ({ children }) => {
  const mainRef = useRef(null);

  useRouteHeadingFocus({ containerRef: mainRef });

  return <main ref={mainRef} className="main-container">{children}</main>;
};

export default Main;
