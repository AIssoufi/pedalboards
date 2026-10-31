import {
  act, fireEvent, render, screen, waitFor
} from '@testing-library/react';
import { Provider } from 'react-redux';
import setupStore from '../redux/store';
import App from './App';
import { jsonResponse } from '../test-utils/fetch';

const EMPTY_GRID_TEXT = 'No plugin matches your search!';
const EMPTY_DETAILS_TEXT = 'No data available';
// Answer of the API for a list without plugins
const EMPTY_PLUGIN_LIST = { data: [], count: 0, numberPages: 0 };
const PLUGIN_ID = '5c0d2b8f';
const PLUGIN_LABEL = 'MDA Overdrive';
const PLUGIN = { _id: PLUGIN_ID, label: PLUGIN_LABEL };
// Answer of the API for a list of that plugin alone
const PLUGIN_LIST = { data: [PLUGIN], count: 1, numberPages: 1 };

// The API answers a plugin at /api/plugin/:id, and the lists at /api/plugins
const isPluginUrl = url => String(url).includes('/api/plugin/');

/**
 * Renders the app at a URL of the browser, with an empty list to each fetch of the plugins.
 *
 * @param {Object} params
 * @param {string} params.url - URL the browser shows when the app starts, such as '/plugin/2'.
 * @param {Object} [params.plugin] - Plugin that the API answers to the fetch of a plugin, none
 *   when omitted.
 * @param {Object} [params.list] - Answer of the API to each fetch of the plugins, empty when
 *   omitted.
 */
const renderAt = ({ url, plugin, list = EMPTY_PLUGIN_LIST }) => {
  vi.spyOn(window, 'fetch').mockImplementation(url => Promise.resolve(jsonResponse({
    body: isPluginUrl(url) ? { data: plugin } : list
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
  renderAt({ url: '/plugins' });

  expect(screen.getByRole('link', { name: 'Plugins' })).toBeDefined();
  // The grid shows its empty state once the answer is in the store
  expect(await screen.findByText(EMPTY_GRID_TEXT)).toBeDefined();
});

it('opens the plugin of a deep link', async () => {
  renderAt({ url: `/plugin/${PLUGIN_ID}` });

  expect(await screen.findByText(EMPTY_DETAILS_TEXT)).toBeDefined();
  expect(fetchedUrls()).toEqual([expect.stringMatching(new RegExp(`/api/plugin/${PLUGIN_ID}$`))]);
});

it('shows the details of the plugin of a deep link, which load in their own chunk', async () => {
  renderAt({ url: `/plugin/${PLUGIN_ID}`, plugin: { _id: PLUGIN_ID, label: PLUGIN_LABEL } });

  expect(await screen.findByRole('heading', { name: PLUGIN_LABEL })).toBeDefined();
});

it('searches the filter and the page of a deep link', async () => {
  renderAt({ url: '/plugins?brand=MDA&page=2' });

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
  renderAt({ url });

  expect(await screen.findByText(EMPTY_GRID_TEXT)).toBeDefined();
  expect(window.location.pathname).toBe('/plugins');
});

describe('a change of route', () => {
  const headingOf = name => screen.findByRole('heading', { level: 1, name });

  // Opens the details from the card of the list, once the list shows it
  const openPluginCard = async () => {
    await screen.findByRole('link', { name: PLUGIN_LABEL });
    const isDetailsLink = link => link.getAttribute('href') === `/plugin/${PLUGIN_ID}`;

    fireEvent.click(screen.getAllByRole('link').find(isDetailsLink));
  };

  it('gives each route its title', async () => {
    renderAt({ url: `/plugin/${PLUGIN_ID}`, plugin: PLUGIN });

    await headingOf(PLUGIN_LABEL);
    expect(document.title).toBe(`${PLUGIN_LABEL} - Pedalboards`);

    fireEvent.click(screen.getByRole('link', { name: 'Plugins' }));

    await headingOf('Plugins');
    expect(document.title).toBe('Plugins - Pedalboards');
  });

  it('focuses the label of the plugin a card opens, through its loading headings', async () => {
    renderAt({ url: '/plugins', plugin: PLUGIN, list: PLUGIN_LIST });

    await openPluginCard();

    const heading = await headingOf(PLUGIN_LABEL);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  it('focuses the heading of the list from the link of the header, which keeps no focus', async () => {
    renderAt({ url: `/plugin/${PLUGIN_ID}`, plugin: PLUGIN });
    const link = screen.getByRole('link', { name: 'Plugins' });
    link.focus();

    fireEvent.click(link);

    expect(document.activeElement).toBe(await headingOf('Plugins'));
  });

  it('focuses the heading of the page the Back button returns to', async () => {
    renderAt({ url: '/plugins', plugin: PLUGIN, list: PLUGIN_LIST });
    await openPluginCard();
    await headingOf(PLUGIN_LABEL);

    act(() => window.history.back());

    const heading = await headingOf('Plugins');
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  it('leaves the focus of the browser after the redirect of the first address', async () => {
    renderAt({ url: '/' });

    await headingOf('Plugins');

    expect(document.activeElement).toBe(document.body);
  });

  it('moves nothing when the search changes the address of the list', async () => {
    renderAt({ url: '/plugins?page=1', list: PLUGIN_LIST });
    await screen.findByRole('link', { name: PLUGIN_LABEL });

    // Async, so that the fetch of the new search ends inside act
    await act(async () => {
      window.history.pushState({}, '', '/plugins?brand=MDA');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(document.activeElement).toBe(document.body);
  });
});
