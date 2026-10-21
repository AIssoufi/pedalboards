import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import setupStore from '../redux/store';
import App from './App';
import { jsonResponse } from '../test-utils/fetch';

const EMPTY_GRID_TEXT = 'Aucun plugin ne correspond à votre recherche !';
const EMPTY_DETAILS_TEXT = 'Pas de données disponible';
// Answer of the API for a list without plugins
const EMPTY_PLUGIN_LIST = { data: [], count: 0, numberPages: 0 };
const PLUGIN_ID = '5c0d2b8f';

// The API answers a plugin at /api/plugin/:id, and the lists at /api/plugins
const isPluginUrl = url => String(url).includes('/api/plugin/');

/**
 * Renders the app at a URL of the browser, with an empty answer to each fetch.
 *
 * @param {string} url - URL the browser shows when the app starts, such as '/plugin/2'.
 */
const renderAt = (url) => {
  vi.spyOn(window, 'fetch').mockImplementation(url => Promise.resolve(jsonResponse({
    body: isPluginUrl(url) ? {} : EMPTY_PLUGIN_LIST
  })));
  window.history.pushState({}, '', url);

  render(
    <Provider store={setupStore()}>
      <App />
    </Provider>
  );
};

const fetchedUrls = () => window.fetch.mock.calls.map(([url]) => String(url));

afterEach(() => {
  vi.restoreAllMocks();
  window.history.pushState({}, '', '/');
});

it('renders without crashing', async () => {
  renderAt('/plugins');

  expect(screen.getByRole('link', { name: 'Plugins' })).toBeDefined();
  // The grid shows its empty state once the answer is in the store
  expect(await screen.findByText(EMPTY_GRID_TEXT)).toBeDefined();
});

it('opens the plugin of a deep link', async () => {
  renderAt(`/plugin/${PLUGIN_ID}`);

  expect(await screen.findByText(EMPTY_DETAILS_TEXT)).toBeDefined();
  expect(fetchedUrls()).toEqual([expect.stringMatching(new RegExp(`/api/plugin/${PLUGIN_ID}$`))]);
});

it('searches the filter and the page of a deep link', async () => {
  renderAt('/plugins?brand=MDA&page=2');

  expect(await screen.findByText(EMPTY_GRID_TEXT)).toBeDefined();
  const { searchParams } = new URL(fetchedUrls()[0]);
  expect(searchParams.get('filterby[brand]')).toBe('MDA');
  expect(searchParams.get('page')).toBe('2');
});

it.each([
  ['the root', '/'],
  ['an unknown path', '/unknown/path'],
  ['a plugin path without an id', '/plugin']
])('redirects %s to the plugins', async (description, url) => {
  renderAt(url);

  expect(await screen.findByText(EMPTY_GRID_TEXT)).toBeDefined();
  expect(window.location.pathname).toBe('/plugins');
});
