// Dependencies
import {
  act, fireEvent, render, screen
} from '@testing-library/react';
import { Provider } from 'react-redux';

// Stub
import {
  MemoryRouter, Route, Routes, useLocation, useNavigate
} from 'react-router';

// Redux - store
import setupStore from '../../redux/store';

// Test utils
import { jsonResponse } from '../../test-utils/fetch';

// Components
import PluginsPage from './index';

const EMPTY_GRID_TEXT = 'Aucun plugin ne correspond à votre recherche !';
const ERROR_TEXT = 'Impossible de charger les plugins, réessayez plus tard.';
const LOADER_TEXT = 'Je Fais ça En Deux Deux...';
const SERVER_ERROR_STATUS = 500;

const PLUGIN = {
  _id: '5c0d2b8f',
  brand: 'A&B',
  categories: ['Delay'],
  label: 'Echo',
  name: 'Echo delay',
  screenshotUrl: 'http://example.com/screenshot'
};

// Longer than the 900 ms debounce of the search field
const SEARCH_DEBOUNCE_WAIT_MS = 1000;

// Filters of a fetched URL, without their `filterby[...]` wrapper, such as [['brand', 'MDA']]
// Lets the answers of the requests started so far reach the store, and the page render them
const flushAnswers = () => act(async () => {});

const filtersOf = url => [...url.searchParams.entries()]
  .filter(([key]) => key.startsWith('filterby['))
  .map(([key, value]) => [key.slice('filterby['.length, -1), value]);

describe('PluginsPage', () => {
  let location;
  let navigate;

  // Keeps the location shown and the navigate function of the router for the assertions
  const RouterSpy = () => {
    location = useLocation();
    navigate = useNavigate();
    return null;
  };

  /**
   * Renders the page at a URL, with an API that answers each list request with the same page.
   *
   * @param {Object} params
   * @param {string} params.url - URL the router starts at, such as '/plugins?brand=MDA'.
   * @param {number} [params.countPlugins] - Number of pages of the results.
   * @param {Object[]} [params.plugins] - Plugins of the page shown.
   */
  const renderPage = async ({ url, countPlugins = 1, plugins = [] }) => {
    vi.spyOn(window, 'fetch').mockImplementation(() => Promise.resolve(jsonResponse({
      body: { data: plugins, count: plugins.length, numberPages: countPlugins }
    })));
    render(
      <Provider store={setupStore()}>
        <MemoryRouter initialEntries={[url]}>
          <RouterSpy />
          <Routes>
            <Route path="/plugins" element={<PluginsPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    // Lets the answer of the first request reach the store
    await flushAnswers();
  };

  const fetchCount = () => window.fetch.mock.calls.length;

  // Filters, page and page size of the last list request
  const lastFetch = () => {
    const url = new URL(String(window.fetch.mock.calls[fetchCount() - 1][0]));
    return {
      filters: filtersOf(url),
      page: Number(url.searchParams.get('page')),
      pageSize: Number(url.searchParams.get('pagesize'))
    };
  };

  // The page shows the pagination above and below the grid: these helpers take the first one
  const getPaginationButton = name => screen.getAllByRole('button', { name })[0];
  const getPageButton = pageNumber => getPaginationButton(String(pageNumber));

  // The fields are filled without an input event, which would start the debounce of the field
  const fillSearch = ({ value, filter }) => {
    const input = screen.getByRole('textbox');
    input.value = value;
    if (filter) screen.getByRole('combobox').value = filter;
    return input.form;
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the loader, then the plugins of the answer', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(jsonResponse({
      body: { data: [PLUGIN], count: 1, numberPages: 1 }
    }));
    render(
      <Provider store={setupStore()}>
        <MemoryRouter initialEntries={['/plugins']}>
          <PluginsPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(LOADER_TEXT)).toBeDefined();
    expect(await screen.findByRole('link', { name: 'Echo' })).toBeDefined();
    expect(screen.queryByText(LOADER_TEXT)).toBeNull();
  });

  it('shows the empty state for an answer without plugins', async () => {
    await renderPage({ url: '/plugins', countPlugins: 0 });

    expect(screen.getByText(EMPTY_GRID_TEXT)).toBeDefined();
  });

  it('fetches the first page of all the plugins without a filter', async () => {
    await renderPage({ url: '/plugins' });

    expect(fetchCount()).toBe(1);
    expect(lastFetch()).toEqual({ filters: [], page: 1, pageSize: 10 });
  });

  it('fetches the filter and the page of the URL', async () => {
    await renderPage({ url: '/plugins?categories=Delay&page=3', countPlugins: 4 });

    expect(lastFetch()).toEqual({ filters: [['categories', 'Delay']], page: 3, pageSize: 10 });
    expect(getPageButton(3).className).toBe('current-page');
  });

  it.each([
    ['brand', 'A&B', [['brand', 'A&B']], '?brand=A%26B'],
    ['label', 'Echo', [['label', 'Echo']], '?label=Echo'],
    ['category', 'Delay', [['categories', 'Delay']], '?categories=Delay']
  ])('filters the grid when the %s of a card is clicked', async (field, linkName, filters, search) => {
    await renderPage({ url: '/plugins', plugins: [PLUGIN] });

    fireEvent.click(screen.getByRole('link', { name: linkName }));
    await flushAnswers();

    expect(location.search).toBe(search);
    expect(lastFetch()).toEqual({ filters, page: 1, pageSize: 10 });
  });

  it('keeps the filter when it goes to another page', async () => {
    await renderPage({ url: '/plugins?brand=MDA', countPlugins: 3 });

    fireEvent.click(getPageButton(2));
    await flushAnswers();

    expect(location.search).toBe('?brand=MDA&page=2');
    expect(lastFetch()).toEqual({ filters: [['brand', 'MDA']], page: 2, pageSize: 10 });
  });

  it('keeps the filter on the next page', async () => {
    await renderPage({ url: '/plugins?brand=MDA&page=2', countPlugins: 3 });

    fireEvent.click(getPaginationButton('NEXT'));
    await flushAnswers();

    expect(location.search).toBe('?brand=MDA&page=3');
    expect(lastFetch().page).toBe(3);
  });

  it.each([
    ['next', 'NEXT', '/plugins?brand=MDA&page=3'],
    ['previous', 'PREVIOUS', '/plugins?brand=MDA']
  ])('stays on the page when there is no %s page', async (direction, buttonName, url) => {
    await renderPage({ url, countPlugins: 3 });
    const { search } = location;

    fireEvent.click(getPaginationButton(buttonName));
    await flushAnswers();

    expect(location.search).toBe(search);
    expect(fetchCount()).toBe(1);
  });

  it('starts a new search on the first page', async () => {
    await renderPage({ url: '/plugins?brand=MDA&page=4', countPlugins: 5 });

    fireEvent.submit(fillSearch({ value: ' Gx ', filter: 'label' }));
    await flushAnswers();

    expect(location.search).toBe('?label=Gx');
    expect(location.pathname).toBe('/plugins');
    expect(lastFetch()).toEqual({ filters: [['label', 'Gx']], page: 1, pageSize: 10 });
  });

  it('lists all the plugins again when the search is emptied', async () => {
    await renderPage({ url: '/plugins?brand=MDA&page=2', countPlugins: 3 });

    fireEvent.submit(fillSearch({ value: '' }));
    await flushAnswers();

    expect(location.search).toBe('');
    expect(lastFetch()).toEqual({ filters: [], page: 1, pageSize: 10 });
  });

  it.each([
    ['the network fails', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['the API answers an error', () => Promise.resolve(jsonResponse({ status: SERVER_ERROR_STATUS }))]
  ])('shows an error message in place of the grid when %s', async (description, answer) => {
    await renderPage({ url: '/plugins' });
    window.fetch.mockImplementation(answer);

    fireEvent.submit(fillSearch({ value: 'Gx' }));
    await flushAnswers();

    expect((await screen.findByRole('alert')).textContent).toBe(ERROR_TEXT);
    expect(screen.queryByText(EMPTY_GRID_TEXT)).toBeNull();
    expect(screen.queryByText(LOADER_TEXT)).toBeNull();
  });

  it('shows the plugins again once a new search answers', async () => {
    await renderPage({ url: '/plugins', plugins: [PLUGIN] });
    window.fetch.mockRejectedValueOnce(new TypeError('offline'));
    fireEvent.submit(fillSearch({ value: 'Gx' }));
    await flushAnswers();
    expect(await screen.findByRole('alert')).toBeDefined();

    fireEvent.submit(fillSearch({ value: 'Echo' }));
    await flushAnswers();

    expect(await screen.findByRole('link', { name: 'Echo' })).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  describe('with the debounce delay of the search field', () => {
    beforeEach(() => {
      // Fakes Date.now too, which the debounce reads
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('adds one history entry when the search is typed, then submitted', async () => {
      await renderPage({ url: '/plugins' });
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'Gx' } });
      fireEvent.submit(input.form);
      // The search field submits the typed value again once its debounce delay is over
      act(() => {
        vi.advanceTimersByTime(SEARCH_DEBOUNCE_WAIT_MS);
      });

      expect(location.search).toBe('?brand=Gx');
      await flushAnswers();
      // A second entry for the same search would keep the search after one step back
      act(() => {
        navigate(-1);
      });
      await flushAnswers();
      expect(location.search).toBe('');
    });
  });

  it('ignores the unknown parameters and an invalid page of the URL', async () => {
    await renderPage({ url: '/plugins?utm_source=x&page=abc' });

    expect(lastFetch()).toEqual({ filters: [], page: 1, pageSize: 10 });
  });
});
