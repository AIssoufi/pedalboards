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

const EMPTY_GRID_TEXT = 'No plugin matches your search!';
const ERROR_TEXT = 'Could not load the plugins, try again later.';
const LOADER_TEXT = 'Loading...';
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

// Lets the answers of the requests started so far reach the store, and the page render them
const flushAnswers = () => act(async () => {});

// Filters of a fetched URL, without their `filterby[...]` wrapper, such as [['brand', 'MDA']]
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

  // Renders the page at a URL, such as '/plugins?brand=MDA', with the API mocked by the caller
  const renderAt = url => render(
    <Provider store={setupStore()}>
      <MemoryRouter initialEntries={[url]}>
        <RouterSpy />
        <Routes>
          <Route path="/plugins" element={<PluginsPage />} />
          <Route path="/plugin/:id" element={null} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  /**
   * Renders the page at a URL, with an API that answers each list request with the same page.
   *
   * @param {Object} params
   * @param {string} params.url - URL the router starts at, such as '/plugins?brand=MDA'.
   * @param {number} [params.countPlugins] - Number of pages of the results.
   * @param {Object[]} [params.plugins] - Plugins of the page shown.
   * @param {number} [params.status] - HTTP status of the answers, such as 500 for a failure.
   */
  const renderPage = async ({
    url, countPlugins = 1, plugins = [], status
  }) => {
    vi.spyOn(window, 'fetch').mockImplementation(() => Promise.resolve(jsonResponse({
      body: { data: plugins, count: plugins.length, numberPages: countPlugins },
      status
    })));
    renderAt(url);
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

  it('titles the page with its one top level heading', async () => {
    await renderPage({ url: '/plugins' });

    expect(screen.getAllByRole('heading', { level: 1 }).map(({ textContent }) => textContent))
      .toEqual(['Plugins']);
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

  describe('when the visitor comes back from a plugin', () => {
    const openPluginAndComeBack = async () => {
      await act(async () => { navigate(`/plugin/${PLUGIN._id}`); });
      expect(screen.queryByRole('heading', { level: 1 })).toBeNull();

      await act(async () => { navigate(-1); });
    };

    it.each([
      ['the first page', '/plugins'],
      ['another page', '/plugins?page=3'],
      ['a filtered list', '/plugins?brand=MDA'],
      ['a filtered list on another page', '/plugins?brand=MDA&page=2']
    ])('shows the list of %s while it reloads, with no loader', async (listName, url) => {
      await renderPage({ url, countPlugins: 3, plugins: [PLUGIN] });
      vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}));

      await openPluginAndComeBack();

      expect(window.fetch).toHaveBeenCalled();
      expect(screen.queryByText(LOADER_TEXT)).toBeNull();
      expect(screen.getByAltText(/Echo/)).toBeDefined();
    });

    it('reloads the list behind the scenes', async () => {
      await renderPage({ url: '/plugins', plugins: [PLUGIN] });

      await openPluginAndComeBack();

      expect(fetchCount()).toBe(2);
    });

    it('keeps the list and shows no error when its reload fails', async () => {
      await renderPage({ url: '/plugins', plugins: [PLUGIN] });
      vi.spyOn(window, 'fetch').mockRejectedValue(new TypeError('offline'));

      await openPluginAndComeBack();
      await flushAnswers();

      expect(screen.queryByText(ERROR_TEXT)).toBeNull();
      expect(screen.getByAltText(/Echo/)).toBeDefined();
    });

    it('shows the loader for a list that the store no longer holds', async () => {
      await renderPage({ url: '/plugins', countPlugins: 3, plugins: [PLUGIN] });
      fireEvent.click(getPageButton(2));
      await flushAnswers();
      vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}));

      await act(async () => { navigate(-1); });

      expect(screen.getByText(LOADER_TEXT)).toBeDefined();
    });
  });

  describe('moving the focus on a page change', () => {
    const getLastButton = name => screen.getAllByRole('button', { name }).at(-1);
    const getList = () => screen.getByRole('region', { name: 'Plugin list' });

    it.each([
      ['NEXT', '?page=3'],
      ['PREVIOUS', ''],
      ['3', '?page=3']
    ])('moves it to the list after %s below the list', async (name, search) => {
      await renderPage({ url: '/plugins?page=2', countPlugins: 3, plugins: [PLUGIN] });

      fireEvent.click(getLastButton(name));
      await flushAnswers();

      expect(location.search).toBe(search);
      expect(document.activeElement).toBe(getList());
    });

    it('keeps the focus on the list while the loader replaces the grid', async () => {
      await renderPage({ url: '/plugins', countPlugins: 3, plugins: [PLUGIN] });
      vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}));

      fireEvent.click(getLastButton('NEXT'));
      await flushAnswers();

      expect(screen.getByText(LOADER_TEXT)).toBeDefined();
      expect(document.activeElement).toBe(getList());
    });

    it('leaves it alone after NEXT above the list', async () => {
      await renderPage({ url: '/plugins', countPlugins: 3, plugins: [PLUGIN] });
      const nextButton = getPaginationButton('NEXT');
      nextButton.focus();

      fireEvent.click(nextButton);
      await flushAnswers();

      expect(document.activeElement).toBe(nextButton);
    });

    it.each([
      ['next', 'NEXT', '/plugins?page=3'],
      ['previous', 'PREVIOUS', '/plugins']
    ])('leaves it alone below the list when there is no %s page', async (direction, name, url) => {
      await renderPage({ url, countPlugins: 3, plugins: [PLUGIN] });
      const button = getLastButton(name);
      button.focus();

      fireEvent.click(button);
      await flushAnswers();

      expect(document.activeElement).toBe(button);
    });
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

  it('shows the filter of the URL in the search form', async () => {
    await renderPage({ url: '/plugins?label=Gx' });

    expect(screen.getByRole('textbox').value).toBe('Gx');
    expect(screen.getByRole('combobox').value).toBe('label');
  });

  it('shows the filter of a card link in the search form', async () => {
    await renderPage({ url: '/plugins?brand=MDA', plugins: [PLUGIN] });

    fireEvent.click(screen.getByRole('link', { name: 'Delay' }));
    await flushAnswers();

    expect(screen.getByRole('textbox').value).toBe('Delay');
    expect(screen.getByRole('combobox').value).toBe('categories');
  });

  describe('with the debounce delay of the search field', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('runs one search for several keystrokes', async () => {
      await renderPage({ url: '/plugins' });
      const input = screen.getByRole('textbox');

      ['M', 'MD', 'MDA'].forEach((value) => {
        fireEvent.change(input, { target: { value } });
      });
      act(() => {
        vi.advanceTimersByTime(SEARCH_DEBOUNCE_WAIT_MS);
      });
      await flushAnswers();

      expect(location.search).toBe('?name=MDA');
      expect(fetchCount()).toBe(2);
      expect(lastFetch().filters).toEqual([['name', 'MDA']]);
    });

    it('adds one history entry when the search is typed, then submitted', async () => {
      await renderPage({ url: '/plugins' });
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'Gx' } });
      fireEvent.submit(input.form);
      // The submit cancels the pending debounce, so nothing searches again once its delay is over
      act(() => {
        vi.advanceTimersByTime(SEARCH_DEBOUNCE_WAIT_MS);
      });

      expect(location.search).toBe('?name=Gx');
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

  describe('with a page past the last one', () => {
    // Makes the API answer the next list requests with this number of pages
    const answerPageCount = (pageCount) => {
      window.fetch.mockImplementation(() => Promise.resolve(jsonResponse({
        body: { data: [PLUGIN], count: 1, numberPages: pageCount }
      })));
    };

    it('shows the plugins of the last page', async () => {
      await renderPage({ url: '/plugins?page=999', countPlugins: 5, plugins: [PLUGIN] });
      await flushAnswers();

      expect(location.search).toBe('?page=5');
      expect(lastFetch()).toEqual({ filters: [], page: 5, pageSize: 10 });
      expect(getPageButton(5).className).toBe('current-page');
      expect(screen.getByRole('link', { name: 'Echo' })).toBeDefined();
      expect(screen.queryByText(EMPTY_GRID_TEXT)).toBeNull();
    });

    it('replaces the page in the history, so going back skips it', async () => {
      await renderPage({ url: '/plugins?brand=MDA&page=999', countPlugins: 3 });
      await flushAnswers();

      expect(location.search).toBe('?brand=MDA&page=3');
      const fetchCountOnLastPage = fetchCount();

      // The URL past the last page was the only entry: there is nothing left to go back to
      await act(async () => {
        navigate(-1);
      });
      await flushAnswers();

      expect(location.search).toBe('?brand=MDA&page=3');
      expect(fetchCount()).toBe(fetchCountOnLastPage);
    });

    it('stays on the last page', async () => {
      await renderPage({ url: '/plugins?page=5', countPlugins: 5 });
      await flushAnswers();

      expect(location.search).toBe('?page=5');
      expect(fetchCount()).toBe(1);
    });

    it('goes to the last page when a filter leaves fewer pages', async () => {
      await renderPage({ url: '/plugins?page=4', countPlugins: 5 });
      answerPageCount(2);

      await act(async () => {
        navigate('/plugins?brand=MDA&page=4');
      });
      await flushAnswers();

      expect(location.search).toBe('?brand=MDA&page=2');
      expect(lastFetch()).toEqual({ filters: [['brand', 'MDA']], page: 2, pageSize: 10 });
    });

    it('reads the count of the new search, not the one of the previous answer', async () => {
      await renderPage({ url: '/plugins?page=2', countPlugins: 5 });
      answerPageCount(9);

      await act(async () => {
        navigate('/plugins?brand=MDA&page=7');
      });
      await flushAnswers();

      expect(location.search).toBe('?brand=MDA&page=7');
      expect(fetchCount()).toBe(2);
    });

    it.each([
      ['/plugins?page=3', 0],
      ['/plugins?page=3', 1]
    ])('goes from %s to the first page of %j pages', async (url, countPlugins) => {
      await renderPage({ url, countPlugins });
      await flushAnswers();

      expect(location.search).toBe('');
      expect(lastFetch().page).toBe(1);
    });

    it('keeps the empty state on the first page of an empty list', async () => {
      await renderPage({ url: '/plugins?brand=MDA&page=3', countPlugins: 0 });
      await flushAnswers();

      expect(location.search).toBe('?brand=MDA');
      expect(screen.getByText(EMPTY_GRID_TEXT)).toBeDefined();
    });

    it.each(['0', '-3', 'abc', ''])('stays on the URL of the invalid page %j', async (page) => {
      await renderPage({ url: `/plugins?page=${page}`, countPlugins: 5 });
      await flushAnswers();

      expect(location.search).toBe(`?page=${page}`);
      expect(lastFetch().page).toBe(1);
      expect(fetchCount()).toBe(1);
    });

    it('does not move when the request fails', async () => {
      await renderPage({ url: '/plugins?page=999', status: SERVER_ERROR_STATUS });
      await flushAnswers();

      expect(location.search).toBe('?page=999');
      expect(screen.getByText(ERROR_TEXT)).toBeDefined();
    });

    it('ignores the count of a search left before its answer', async () => {
      let answerFirstSearch;
      vi.spyOn(window, 'fetch')
        .mockImplementationOnce(() => new Promise((resolve) => {
          answerFirstSearch = resolve;
        }))
        .mockImplementation(() => Promise.resolve(jsonResponse({
          body: { data: [PLUGIN], count: 1, numberPages: 1 }
        })));
      renderAt('/plugins?page=999');

      await act(async () => {
        navigate('/plugins?brand=MDA');
      });
      await act(async () => {
        answerFirstSearch(jsonResponse({ body: { data: [], count: 0, numberPages: 5 } }));
      });
      await flushAnswers();

      expect(location.search).toBe('?brand=MDA');
      expect(screen.getByRole('link', { name: 'Echo' })).toBeDefined();
    });
  });
});
