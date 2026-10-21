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
import store from '../../redux/store';

// Components
import Plugins, { PluginsPage } from './index';

const EMPTY_GRID_TEXT = 'Aucun plugin ne correspond à votre recherche !';

it('renders without crashing', async () => {
  // The store fetches the plugins: an answer keeps its promise from failing in a later test
  const emptyAnswer = { data: [], count: 0, numberPages: 0 };
  vi.spyOn(window, 'fetch')
    .mockImplementation(() => Promise.resolve({ json: () => emptyAnswer }));
  try {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/plugins']}>
          <Routes>
            <Route path="/plugins" element={<Plugins />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // The grid shows its empty state once the answer is in the store
    expect(await screen.findByText(EMPTY_GRID_TEXT)).toBeDefined();
  } finally {
    window.fetch.mockRestore();
  }
});

const PLUGIN = {
  _id: '5c0d2b8f',
  brand: 'A&B',
  categories: ['Delay'],
  label: 'Echo',
  name: 'Echo delay',
  screenshotUrl: 'http://example.com/screenshot'
};

const entriesOf = searchParams => [...searchParams.entries()];

// Longer than the 900 ms debounce of the search field
const SEARCH_DEBOUNCE_WAIT_MS = 1000;

describe('PluginsPage', () => {
  let location;
  let navigate;
  let fetchPlugins;
  let findPlugins;

  // Keeps the location shown and the navigate function of the router for the assertions
  const RouterSpy = () => {
    location = useLocation();
    navigate = useNavigate();
    return null;
  };

  /**
   * Renders the page at a URL, with stand-ins for the actions that fetch the plugins.
   *
   * @param {Object} params
   * @param {string} params.url - URL the router starts at, such as '/plugins?brand=MDA'.
   * @param {number} [params.countPlugins] - Number of pages of the results.
   * @param {Object[]} [params.plugins] - Plugins of the page shown.
   */
  const renderPage = ({ url, countPlugins = 1, plugins = [] }) => {
    render(
      <MemoryRouter initialEntries={[url]}>
        <RouterSpy />
        <Routes>
          <Route
            path="/plugins"
            element={(
              <PluginsPage
                fetchPlugins={fetchPlugins}
                findPlugins={findPlugins}
                plugins={plugins}
                countPlugins={countPlugins}
              />
            )}
          />
        </Routes>
      </MemoryRouter>
    );
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

  const lastFindCall = () => {
    const [filters, page, pageSize] = findPlugins.mock.calls[findPlugins.mock.calls.length - 1];
    return { filters: entriesOf(filters), page, pageSize };
  };

  beforeEach(() => {
    fetchPlugins = vi.fn(() => Promise.resolve({}));
    findPlugins = vi.fn(() => Promise.resolve({}));
  });

  it('fetches the first page of all the plugins without a filter', () => {
    renderPage({ url: '/plugins' });

    expect(fetchPlugins).toHaveBeenCalledWith(1, 10);
    expect(findPlugins).not.toHaveBeenCalled();
  });

  it('fetches the filter and the page of the URL', () => {
    renderPage({ url: '/plugins?categories=Delay&page=3', countPlugins: 4 });

    expect(lastFindCall()).toEqual({ filters: [['categories', 'Delay']], page: 3, pageSize: 10 });
    expect(getPageButton(3).className).toBe('current-page');
  });

  it.each([
    ['brand', 'A&B', [['brand', 'A&B']], '?brand=A%26B'],
    ['label', 'Echo', [['label', 'Echo']], '?label=Echo'],
    ['category', 'Delay', [['categories', 'Delay']], '?categories=Delay']
  ])('filters the grid when the %s of a card is clicked', (field, linkName, filters, search) => {
    renderPage({ url: '/plugins', plugins: [PLUGIN] });

    fireEvent.click(screen.getByRole('link', { name: linkName }));

    expect(location.search).toBe(search);
    expect(lastFindCall()).toEqual({ filters, page: 1, pageSize: 10 });
  });

  it('keeps the filter when it goes to another page', () => {
    renderPage({ url: '/plugins?brand=MDA', countPlugins: 3 });

    fireEvent.click(getPageButton(2));

    expect(location.search).toBe('?brand=MDA&page=2');
    expect(lastFindCall()).toEqual({ filters: [['brand', 'MDA']], page: 2, pageSize: 10 });
    expect(fetchPlugins).not.toHaveBeenCalled();
  });

  it('keeps the filter on the next page', () => {
    renderPage({ url: '/plugins?brand=MDA&page=2', countPlugins: 3 });

    fireEvent.click(getPaginationButton('NEXT'));

    expect(location.search).toBe('?brand=MDA&page=3');
    expect(lastFindCall().page).toBe(3);
  });

  it.each([
    ['next', 'NEXT', '/plugins?brand=MDA&page=3'],
    ['previous', 'PREVIOUS', '/plugins?brand=MDA']
  ])('stays on the page when there is no %s page', (direction, buttonName, url) => {
    renderPage({ url, countPlugins: 3 });
    const { search } = location;

    fireEvent.click(getPaginationButton(buttonName));

    expect(location.search).toBe(search);
    expect(findPlugins).toHaveBeenCalledTimes(1);
  });

  it('starts a new search on the first page', () => {
    renderPage({ url: '/plugins?brand=MDA&page=4', countPlugins: 5 });

    fireEvent.submit(fillSearch({ value: ' Gx ', filter: 'label' }));

    expect(location.search).toBe('?label=Gx');
    expect(location.pathname).toBe('/plugins');
    expect(lastFindCall()).toEqual({ filters: [['label', 'Gx']], page: 1, pageSize: 10 });
  });

  it('lists all the plugins again when the search is emptied', () => {
    renderPage({ url: '/plugins?brand=MDA&page=2', countPlugins: 3 });

    fireEvent.submit(fillSearch({ value: '' }));

    expect(location.search).toBe('');
    expect(fetchPlugins).toHaveBeenCalledWith(1, 10);
  });

  describe('with the debounce delay of the search field', () => {
    beforeEach(() => {
      // Fakes Date.now too, which the debounce reads
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('adds one history entry when the search is typed, then submitted', () => {
      renderPage({ url: '/plugins' });
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'Gx' } });
      fireEvent.submit(input.form);
      // The search field submits the typed value again once its debounce delay is over
      act(() => {
        vi.advanceTimersByTime(SEARCH_DEBOUNCE_WAIT_MS);
      });

      expect(location.search).toBe('?brand=Gx');
      // A second entry for the same search would keep the search after one step back
      act(() => {
        navigate(-1);
      });
      expect(location.search).toBe('');
    });
  });

  it('renders without props', () => {
    let container;
    expect(() => {
      ({ container } = render(<MemoryRouter><PluginsPage /></MemoryRouter>));
    }).not.toThrow();
    expect(container.querySelector('.plugin')).toBeNull();
  });

  it('ignores the unknown parameters and an invalid page of the URL', () => {
    renderPage({ url: '/plugins?utm_source=x&page=abc' });

    expect(fetchPlugins).toHaveBeenCalledWith(1, 10);
    expect(findPlugins).not.toHaveBeenCalled();
  });
});
