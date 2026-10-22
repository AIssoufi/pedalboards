// Dependencies
import { act, render, screen } from '@testing-library/react';

// Stub
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

// Components
import PedalboardDetails from './index';

// Test utils
import { jsonResponse } from '../../test-utils/fetch';

const LOADER_TEXT = 'Je Fais ça En Deux Deux...';
const EMPTY_STATE_TEXT = 'Pas de données disponible';
const ERROR_TEXT = 'Impossible de charger ce plugin, réessayez plus tard.';
const SERVER_ERROR_STATUS = 500;

/**
 * Answers each fetch with the plugin that `getPlugin` gives for its URL.
 *
 * @param {Function} getPlugin - Gives the plugin of a URL, or `undefined` for no plugin.
 */
const mockFetch = getPlugin => vi.spyOn(window, 'fetch')
  .mockImplementation(url => Promise.resolve(jsonResponse({ body: { data: getPlugin(String(url)) } })));

/**
 * Holds each fetch until the test answers it with the plugin of its id.
 *
 * @returns {Object} A function by plugin id, which answers the fetch of that id.
 */
const holdFetch = () => {
  const answerById = {};
  vi.spyOn(window, 'fetch').mockImplementation(url => new Promise((resolve) => {
    const id = String(url).split('/').pop();
    answerById[id] = () => resolve(jsonResponse({ body: { data: { uri: `https://plugin/${id}` } } }));
  }));
  return answerById;
};

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Renders the page in a router started at a URL. Its `/plugin` route has no id parameter.
 *
 * @param {string} url - URL the router starts at, such as '/plugin/2'.
 * @returns {Object} The router, whose `navigate` changes the URL.
 */
const renderAt = (url) => {
  const router = createMemoryRouter(
    [
      { path: '/plugin/:id', element: <PedalboardDetails /> },
      { path: '/plugin', element: <PedalboardDetails /> }
    ],
    { initialEntries: [url] }
  );
  render(<RouterProvider router={router} />);
  return router;
};

// Goes to another URL, inside act since the page renders again
const navigate = async ({ router, url }) => {
  await act(() => router.navigate(url));
};

it('renders without crashing', async () => {
  // The page fetches the plugin: an answer keeps its promise from failing after the test
  mockFetch(() => undefined);
  renderAt('/plugin/2');

  // An answer without a plugin leaves the page with its empty state
  expect(await screen.findByText(EMPTY_STATE_TEXT)).toBeDefined();
  expect(screen.getByText(EMPTY_STATE_TEXT).lang).toBe('fr');
});

it('shows the loader, then the plugin of the id of its route', async () => {
  mockFetch(url => (url.endsWith('/plugin/2') ? { uri: 'https://plugin/2' } : undefined));
  renderAt('/plugin/2');

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
  expect(await screen.findByRole('link', { name: 'https://plugin/2' })).toBeDefined();
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
});

it('fetches the plugin of a new id and shows the loader until it answers', async () => {
  const answerById = holdFetch();
  const router = renderAt('/plugin/2');
  answerById['2']();
  expect(await screen.findByRole('link', { name: 'https://plugin/2' })).toBeDefined();

  await navigate({ router, url: '/plugin/3' });

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
  answerById['3']();
  expect(await screen.findByRole('link', { name: 'https://plugin/3' })).toBeDefined();
  expect(window.fetch).toHaveBeenCalledTimes(2);
});

it.each([
  ['the network fails', () => Promise.reject(new TypeError('Failed to fetch'))],
  ['the API answers an error', () => Promise.resolve(jsonResponse({ status: SERVER_ERROR_STATUS }))]
])('shows an error message when %s', async (description, answer) => {
  vi.spyOn(window, 'fetch').mockImplementation(answer);
  renderAt('/plugin/2');

  expect((await screen.findByRole('alert')).textContent).toBe(ERROR_TEXT);
  expect(screen.getByRole('alert').lang).toBe('fr');
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
  expect(screen.queryByText(EMPTY_STATE_TEXT)).toBeNull();
});

it('shows the plugin of a new id after an error', async () => {
  vi.spyOn(window, 'fetch').mockImplementationOnce(() => Promise.reject(new TypeError('offline')));
  mockFetch(url => ({ uri: `https://plugin/${url.split('/').pop()}` }));
  const router = renderAt('/plugin/2');
  expect(await screen.findByRole('alert')).toBeDefined();

  await navigate({ router, url: '/plugin/3' });

  expect(await screen.findByRole('link', { name: 'https://plugin/3' })).toBeDefined();
  expect(screen.queryByRole('alert')).toBeNull();
});

it.each([
  ['outside a router', () => render(<PedalboardDetails />)],
  ['on a route without an id', () => renderAt('/plugin')]
])('renders its empty state %s, without fetching', async (description, renderPage) => {
  mockFetch(() => undefined);

  renderPage();

  expect(await screen.findByText(EMPTY_STATE_TEXT)).toBeDefined();
  expect(window.fetch).not.toHaveBeenCalled();
});

it('ignores the late answer of a previous id', async () => {
  const answerById = holdFetch();
  const router = renderAt('/plugin/2');
  await navigate({ router, url: '/plugin/3' });

  answerById['3']();
  expect(await screen.findByRole('link', { name: 'https://plugin/3' })).toBeDefined();
  answerById['2']();

  // The answer for id 2 settles, then leaves the plugin of id 3 on the page
  await new Promise((resolve) => { setTimeout(resolve); });
  expect(screen.getByRole('link', { name: 'https://plugin/3' })).toBeDefined();
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
});

it('shows its empty state when the route loses its id', async () => {
  mockFetch(url => ({ uri: `https://plugin/${url.split('/').pop()}` }));
  const router = renderAt('/plugin/2');
  expect(await screen.findByRole('link', { name: 'https://plugin/2' })).toBeDefined();

  await navigate({ router, url: '/plugin' });

  expect(screen.getByText(EMPTY_STATE_TEXT)).toBeDefined();
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
  expect(window.fetch).toHaveBeenCalledTimes(1);
});

it('shows an error message, not a blank app, when the details fail to load', async () => {
  // React reports the error that the boundary catches
  vi.spyOn(console, 'error').mockImplementation(() => {});
  // The chunk of the details fails, as after a deploy that removed it: the page loads again, so
  // that its lazy import meets the failing module
  vi.doMock('../../components/pedalboard-details', () => {
    throw new TypeError('Failed to fetch dynamically imported module');
  });
  onTestFinished(() => {
    vi.doUnmock('../../components/pedalboard-details');
  });
  vi.resetModules();
  const { default: PageWithFailingDetails } = await import('./index');
  mockFetch(() => ({ uri: 'https://plugin/2' }));

  const router = createMemoryRouter(
    [{ path: '/plugin/:id', element: <PageWithFailingDetails /> }],
    { initialEntries: ['/plugin/2'] }
  );
  render(<RouterProvider router={router} />);

  expect((await screen.findByRole('alert')).textContent).toBe(ERROR_TEXT);
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
});
