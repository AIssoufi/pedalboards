// Dependencies
import { act, render, screen } from '@testing-library/react';

// Stub
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

// Components
import PedalboardDetails from './index';

const LOADER_TEXT = 'Je Fais ça En Deux Deux...';
const EMPTY_STATE_TEXT = 'Pas de données disponible';

/**
 * Answers each fetch with the plugin that `getPlugin` gives for its URL.
 *
 * @param {Function} getPlugin - Gives the plugin of a URL, or `undefined` for no plugin.
 */
const mockFetch = getPlugin => vi.spyOn(window, 'fetch')
  .mockImplementation(url => Promise.resolve({ json: () => ({ data: getPlugin(String(url)) }) }));

/**
 * Holds each fetch until the test answers it with the plugin of its id.
 *
 * @returns {Object} A function by plugin id, which answers the fetch of that id.
 */
const holdFetch = () => {
  const answerById = {};
  vi.spyOn(window, 'fetch').mockImplementation(url => new Promise((resolve) => {
    const id = String(url).split('/').pop();
    answerById[id] = () => resolve({ json: () => ({ data: { uri: `https://plugin/${id}` } }) });
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

it('shows the empty state when the fetch fails', async () => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(window, 'fetch').mockImplementation(() => Promise.reject(new Error('offline')));
  renderAt('/plugin/2');

  expect(await screen.findByText(EMPTY_STATE_TEXT)).toBeDefined();
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
