// Dependencies
import { Component } from 'react';

/**
 * Props of {@link ErrorBoundary}.
 *
 * @typedef {Object} ErrorBoundaryProps
 * @property {import('react').ReactNode} [children=null] - Content that may throw while it
 *   renders, such as a lazy component whose chunk fails to load.
 * @property {import('react').ReactNode} [fallback=null] - Shown in place of the content once it
 *   threw.
 */

/**
 * Renders its content, or its fallback once the content threw while rendering, so that the error
 * does not unmount the whole app. Wraps a lazy component, whose chunk fails to load on a lost
 * connection or after a deploy that removed it. It never resets, since React keeps the failed
 * import of a lazy component, so a retry would fail again.
 *
 * @extends {Component<ErrorBoundaryProps>}
 *
 * @example
 * <ErrorBoundary fallback={<p role="alert">Impossible de charger ce plugin.</p>}>
 *   <LazyDetails />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    const { children = null, fallback = null } = this.props;
    const { hasError } = this.state;
    return hasError ? fallback : children;
  }
}

export default ErrorBoundary;
