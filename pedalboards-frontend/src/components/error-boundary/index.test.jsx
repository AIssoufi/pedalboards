// Dependencies
import { render, screen } from '@testing-library/react';

// Components
import ErrorBoundary from './index';

const FALLBACK_TEXT = 'Impossible de charger ce plugin, réessayez plus tard.';

// Throws while it renders, as a lazy component whose chunk fails to load
const Failing = () => {
  throw new TypeError('Failed to fetch dynamically imported module');
};

beforeEach(() => {
  // React reports each error that a boundary catches
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('renders nothing without props', () => {
  const { container } = render(<ErrorBoundary />);

  expect(container.innerHTML).toBe('');
});

it('renders its content when it renders', () => {
  render(
    <ErrorBoundary fallback={<p role="alert">{FALLBACK_TEXT}</p>}>
      <p>Details</p>
    </ErrorBoundary>
  );

  expect(screen.getByText('Details')).toBeDefined();
  expect(screen.queryByRole('alert')).toBeNull();
});

it('renders its fallback when its content throws, and leaves the rest of the app', () => {
  render(
    <>
      <nav>Header</nav>
      <ErrorBoundary fallback={<p role="alert">{FALLBACK_TEXT}</p>}><Failing /></ErrorBoundary>
    </>
  );

  expect(screen.getByRole('alert').textContent).toBe(FALLBACK_TEXT);
  expect(screen.getByText('Header')).toBeDefined();
});

it('renders nothing in place of content that throws without a fallback', () => {
  render(<><nav>Header</nav><ErrorBoundary><Failing /></ErrorBoundary></>);

  expect(screen.getByText('Header')).toBeDefined();
  expect(document.body.textContent).toBe('Header');
});
