// Dependencies
import {
  act, fireEvent, render, screen
} from '@testing-library/react';

// Stub
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

// Components
import PedalboardDetails from './index';

// Test utils
import { jsonResponse } from '../../test-utils/fetch';

const LOADER_TEXT = 'Loading...';
const EMPTY_STATE_TEXT = 'No data available';
const ERROR_TEXT = 'Could not load this plugin, try again later.';
const NOT_FOUND_TEXT = 'This plugin does not exist. See the list of plugins';
const LIST_LINK_NAME = 'See the list of plugins';
const LIST_PAGE_TEXT = 'The list of plugins';
const NOT_FOUND_STATUS = 404;
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
 * @returns {Object} A function by plugin id, which answers the fetch of that id, with the extra
 *   fields it receives.
 */
const holdFetch = () => {
  const answerById = {};
  vi.spyOn(window, 'fetch').mockImplementation(url => new Promise((resolve) => {
    const id = String(url).split('/').pop();
    answerById[id] = fields => resolve(jsonResponse({
      body: { data: { uri: `https://plugin/${id}`, ...fields } }
    }));
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
      { path: '/plugin', element: <PedalboardDetails /> },
      { path: '/plugins', element: <p>{LIST_PAGE_TEXT}</p> }
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

// Texts of the top level headings of the page, hidden ones included
const readPageTitles = () => screen.queryAllByRole('heading', { level: 1 })
  .map(heading => heading.textContent);

describe('the title of the page', () => {
  it('names the page generically while the plugin loads', async () => {
    holdFetch();
    renderAt('/plugin/2');

    expect(await screen.findByText(LOADER_TEXT)).toBeDefined();
    expect(readPageTitles()).toEqual(['Plugin']);
  });

  it('names the page generically when the plugin fails to load', async () => {
    vi.spyOn(window, 'fetch').mockImplementation(() => Promise.reject(new TypeError('offline')));
    renderAt('/plugin/2');

    expect(await screen.findByRole('alert')).toBeDefined();
    expect(readPageTitles()).toEqual(['Plugin']);
  });

  it('names the page generically when there is no plugin', async () => {
    mockFetch(() => undefined);
    renderAt('/plugin/2');

    expect(await screen.findByText(EMPTY_STATE_TEXT)).toBeDefined();
    expect(readPageTitles()).toEqual(['Plugin']);
  });

  it.each([
    ['has no label', {}],
    ['has an empty label', { label: '' }],
    ['has a null label', { label: null }],
    ['has a label made only of spaces', { label: '   ' }]
  ])('names the page generically when the plugin %s', async (description, labelField) => {
    mockFetch(() => ({ uri: 'https://plugin/2', ...labelField }));
    renderAt('/plugin/2');

    expect(await screen.findByText('https://plugin/2')).toBeDefined();
    expect(readPageTitles()).toEqual(['Plugin']);
  });

  it('leaves the label of the loaded plugin as the only title', async () => {
    mockFetch(() => ({ uri: 'https://plugin/2', label: 'abGate' }));
    renderAt('/plugin/2');

    expect(await screen.findByText('https://plugin/2')).toBeDefined();
    expect(readPageTitles()).toEqual(['abGate']);
  });
});

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
  expect(await screen.findByText('https://plugin/2')).toBeDefined();
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
});

it('fetches the plugin of a new id and shows the loader until it answers', async () => {
  const answerById = holdFetch();
  const router = renderAt('/plugin/2');
  answerById['2']();
  expect(await screen.findByText('https://plugin/2')).toBeDefined();

  await navigate({ router, url: '/plugin/3' });

  expect(screen.getByText(LOADER_TEXT)).toBeDefined();
  // The chunk of the details is loaded by now, so this loader is the one of the fetch
  expect(readPageTitles()).toEqual(['Plugin']);
  answerById['3']();
  expect(await screen.findByText('https://plugin/3')).toBeDefined();
  expect(window.fetch).toHaveBeenCalledTimes(2);
});

it.each([
  ['the network fails', () => Promise.reject(new TypeError('Failed to fetch'))],
  ['the API answers an error', () => Promise.resolve(jsonResponse({ status: SERVER_ERROR_STATUS }))],
  ['the API answers a status written as a string', () => Promise.resolve({ ok: false, status: '404' })],
  ['the API answers without a status', () => Promise.resolve({ ok: false })],
  ['the API answers a body that is not JSON', () => Promise.resolve({
    ok: true, status: 200, json: () => Promise.reject(new SyntaxError('Unexpected token'))
  })]
])('shows the retry message when %s', async (description, answer) => {
  vi.spyOn(window, 'fetch').mockImplementation(answer);
  renderAt('/plugin/2');

  expect((await screen.findByRole('alert')).textContent).toBe(ERROR_TEXT);
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
  expect(screen.queryByText(EMPTY_STATE_TEXT)).toBeNull();
});

it('shows a not-found message with a link to the list when the API knows no such id', async () => {
  vi.spyOn(window, 'fetch').mockResolvedValue(jsonResponse({ status: NOT_FOUND_STATUS }));
  const router = renderAt('/plugin/does-not-exist');

  expect((await screen.findByRole('alert')).textContent).toBe(NOT_FOUND_TEXT);
  expect(screen.queryByText(ERROR_TEXT)).toBeNull();
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
  expect(readPageTitles()).toEqual(['Plugin']);

  await act(() => fireEvent.click(screen.getByRole('link', { name: LIST_LINK_NAME })));

  expect(router.state.location.pathname).toBe('/plugins');
  expect(screen.getByText(LIST_PAGE_TEXT)).toBeDefined();
});

it('shows the plugin of a new id after a not-found answer', async () => {
  vi.spyOn(window, 'fetch').mockResolvedValueOnce(jsonResponse({ status: NOT_FOUND_STATUS }));
  mockFetch(url => ({ uri: `https://plugin/${url.split('/').pop()}` }));
  const router = renderAt('/plugin/2');
  expect((await screen.findByRole('alert')).textContent).toBe(NOT_FOUND_TEXT);

  await navigate({ router, url: '/plugin/3' });

  expect(await screen.findByText('https://plugin/3')).toBeDefined();
  expect(screen.queryByRole('alert')).toBeNull();
});

it('shows the plugin of a new id after an error', async () => {
  vi.spyOn(window, 'fetch').mockImplementationOnce(() => Promise.reject(new TypeError('offline')));
  mockFetch(url => ({ uri: `https://plugin/${url.split('/').pop()}` }));
  const router = renderAt('/plugin/2');
  expect(await screen.findByRole('alert')).toBeDefined();

  await navigate({ router, url: '/plugin/3' });

  expect(await screen.findByText('https://plugin/3')).toBeDefined();
  expect(screen.queryByRole('alert')).toBeNull();
});

it.each([
  ['outside a router', () => render(<PedalboardDetails />)],
  ['on a route without an id', () => renderAt('/plugin')]
])('renders its empty state %s, without fetching', async (description, renderPage) => {
  mockFetch(() => undefined);

  renderPage();

  expect(await screen.findByText(EMPTY_STATE_TEXT)).toBeDefined();
  expect(readPageTitles()).toEqual(['Plugin']);
  expect(window.fetch).not.toHaveBeenCalled();
});

it('ignores the late answer of a previous id', async () => {
  const answerById = holdFetch();
  const router = renderAt('/plugin/2');
  await navigate({ router, url: '/plugin/3' });

  answerById['3']();
  expect(await screen.findByText('https://plugin/3')).toBeDefined();
  answerById['2']();

  // The answer for id 2 settles, then leaves the plugin of id 3 on the page
  await new Promise((resolve) => { setTimeout(resolve); });
  expect(screen.getByText('https://plugin/3')).toBeDefined();
  expect(screen.queryByText(LOADER_TEXT)).toBeNull();
});

it('shows its empty state when the route loses its id', async () => {
  mockFetch(url => ({ uri: `https://plugin/${url.split('/').pop()}` }));
  const router = renderAt('/plugin/2');
  expect(await screen.findByText('https://plugin/2')).toBeDefined();

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
  expect(readPageTitles()).toEqual(['Plugin']);
});

describe('the title of the tab', () => {
  it('names the plugin once it has loaded', async () => {
    mockFetch(() => ({ uri: 'https://plugin/2', label: 'abGate' }));
    renderAt('/plugin/2');

    expect(await screen.findByRole('heading', { name: 'abGate' })).toBeDefined();
    expect(document.title).toBe('abGate - Pedalboards');
  });

  it('names the page while the plugin loads', async () => {
    holdFetch();
    renderAt('/plugin/2');

    expect(await screen.findByText(LOADER_TEXT)).toBeDefined();
    expect(document.title).toBe('Plugin - Pedalboards');
  });

  it('names the page when the plugin fails to load', async () => {
    vi.spyOn(window, 'fetch').mockImplementation(() => Promise.reject(new TypeError('offline')));
    renderAt('/plugin/2');

    expect(await screen.findByRole('alert')).toBeDefined();
    expect(document.title).toBe('Plugin - Pedalboards');
  });

  it('names the page when the API knows no such plugin', async () => {
    vi.spyOn(window, 'fetch').mockImplementation(() => Promise.resolve(jsonResponse({
      body: {},
      status: NOT_FOUND_STATUS
    })));
    renderAt('/plugin/2');

    expect(await screen.findByRole('alert')).toBeDefined();
    expect(document.title).toBe('Plugin - Pedalboards');
  });

  it('names the page on a route without an id', async () => {
    renderAt('/plugin');

    expect(await screen.findByText(EMPTY_STATE_TEXT)).toBeDefined();
    expect(document.title).toBe('Plugin - Pedalboards');
  });

  it.each([
    ['no label', {}],
    ['an empty label', { label: '' }],
    ['a null label', { label: null }],
    ['a label made only of spaces', { label: '   ' }],
    ['a label that is no text', { label: 42 }]
  ])('names the page for a plugin with %s', async (description, labelField) => {
    mockFetch(() => ({ uri: 'https://plugin/2', ...labelField }));
    renderAt('/plugin/2');

    expect(await screen.findByRole('heading', { name: 'Plugin' })).toBeDefined();
    expect(document.title).toBe('Plugin - Pedalboards');
  });

  it('follows the plugin of a new id, with the page name while it loads', async () => {
    const answerById = holdFetch();
    const router = renderAt('/plugin/1');
    await act(async () => {
      answerById[1]({ label: 'abGate' });
    });
    await screen.findByRole('heading', { name: 'abGate' });
    expect(document.title).toBe('abGate - Pedalboards');

    await navigate({ router, url: '/plugin/2' });

    expect(document.title).toBe('Plugin - Pedalboards');
  });
});

it.each([
  ['a loading plugin', () => holdFetch(), 'Plugin'],
  ['a loaded plugin', () => mockFetch(() => ({ uri: 'https://plugin/2', label: 'abGate' })), 'abGate']
])('makes the heading of %s focusable by a script only', async (description, mockApi, name) => {
  mockApi();
  renderAt('/plugin/2');

  expect((await screen.findByRole('heading', { name })).getAttribute('tabindex')).toBe('-1');
});
