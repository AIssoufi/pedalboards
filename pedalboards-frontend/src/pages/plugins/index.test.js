// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';

// Stub
import { MemoryRouter, Route } from 'react-router-dom';

// Redux - store
import store from 'redux/store';

// Components
import Plugins, { PluginsPage } from './index';

it('renders without crashing', () => {
  // The store fetches the plugins: an answer keeps its promise from failing in a later test
  const emptyAnswer = { data: [], count: 0, numberPages: 0 };
  jest.spyOn(window, 'fetch')
    .mockImplementation(() => Promise.resolve({ json: () => emptyAnswer }));
  const div = document.createElement('div');
  try {
    ReactDOM.render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/plugins']}>
          <Route path="/plugins" component={Plugins} />
        </MemoryRouter>
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
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
  let div;
  let location;
  let history;
  let fetchPlugins;
  let findPlugins;

  /**
   * Renders the page at a URL, with stand-ins for the actions that fetch the plugins.
   *
   * @param {Object} params
   * @param {string} params.url - URL the router starts at, such as '/plugins?brand=MDA'.
   * @param {number} [params.countPlugins] - Number of pages of the results.
   * @param {Object[]} [params.plugins] - Plugins of the page shown.
   */
  const renderPage = ({ url, countPlugins = 1, plugins = [] }) => {
    act(() => {
      ReactDOM.render(
        <MemoryRouter initialEntries={[url]}>
          <Route
            path="/plugins"
            render={(routeProps) => {
              ({ location, history } = routeProps);
              return (
                <PluginsPage
                  {...routeProps}
                  fetchPlugins={fetchPlugins}
                  findPlugins={findPlugins}
                  plugins={plugins}
                  countPlugins={countPlugins}
                />
              );
            }}
          />
        </MemoryRouter>,
        div
      );
    });
  };

  const click = (element) => {
    act(() => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
    });
  };

  const findPageButton = pageNumber => [...div.querySelectorAll('.numero-de-page button')]
    .find(button => button.textContent === String(pageNumber));

  const lastFindCall = () => {
    const [filters, page, pageSize] = findPlugins.mock.calls[findPlugins.mock.calls.length - 1];
    return { filters: entriesOf(filters), page, pageSize };
  };

  beforeEach(() => {
    fetchPlugins = jest.fn(() => Promise.resolve({}));
    findPlugins = jest.fn(() => Promise.resolve({}));
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  });

  it('fetches the first page of all the plugins without a filter', () => {
    renderPage({ url: '/plugins' });

    expect(fetchPlugins).toHaveBeenCalledWith(1, 10);
    expect(findPlugins).not.toHaveBeenCalled();
  });

  it('fetches the filter and the page of the URL', () => {
    renderPage({ url: '/plugins?categories=Delay&page=3', countPlugins: 4 });

    expect(lastFindCall()).toEqual({ filters: [['categories', 'Delay']], page: 3, pageSize: 10 });
    expect(div.querySelector('.current-page').textContent).toBe('3');
  });

  it.each([
    ['brand', '.info.brand', [['brand', 'A&B']], '?brand=A%26B'],
    ['label', '.info:not(.brand)', [['label', 'Echo']], '?label=Echo'],
    ['category', '.category', [['categories', 'Delay']], '?categories=Delay']
  ])('filters the grid when the %s of a card is clicked', (field, selector, filters, search) => {
    renderPage({ url: '/plugins', plugins: [PLUGIN] });

    click(div.querySelector(selector));

    expect(location.search).toBe(search);
    expect(lastFindCall()).toEqual({ filters, page: 1, pageSize: 10 });
  });

  it('keeps the filter when it goes to another page', () => {
    renderPage({ url: '/plugins?brand=MDA', countPlugins: 3 });

    click(findPageButton(2));

    expect(location.search).toBe('?brand=MDA&page=2');
    expect(lastFindCall()).toEqual({ filters: [['brand', 'MDA']], page: 2, pageSize: 10 });
    expect(fetchPlugins).not.toHaveBeenCalled();
  });

  it('keeps the filter on the next page', () => {
    renderPage({ url: '/plugins?brand=MDA&page=2', countPlugins: 3 });

    click(div.querySelector('.page-suivante'));

    expect(location.search).toBe('?brand=MDA&page=3');
    expect(lastFindCall().page).toBe(3);
  });

  it.each([
    ['next', '.page-suivante', '/plugins?brand=MDA&page=3'],
    ['previous', '.page-precedente', '/plugins?brand=MDA']
  ])('stays on the page when there is no %s page', (direction, selector, url) => {
    renderPage({ url, countPlugins: 3 });
    const { search } = location;

    click(div.querySelector(selector));

    expect(location.search).toBe(search);
    expect(findPlugins).toHaveBeenCalledTimes(1);
  });

  it('starts a new search on the first page', () => {
    renderPage({ url: '/plugins?brand=MDA&page=4', countPlugins: 5 });
    const form = div.querySelector('form');
    form.querySelector('input[name="value"]').value = ' Gx ';
    form.querySelector('select[name="label"]').value = 'label';

    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(location.search).toBe('?label=Gx');
    expect(lastFindCall()).toEqual({ filters: [['label', 'Gx']], page: 1, pageSize: 10 });
  });

  it('lists all the plugins again when the search is emptied', () => {
    renderPage({ url: '/plugins?brand=MDA&page=2', countPlugins: 3 });
    const form = div.querySelector('form');
    form.querySelector('input[name="value"]').value = '';

    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(location.search).toBe('');
    expect(fetchPlugins).toHaveBeenCalledWith(1, 10);
  });

  describe('with the debounce delay of the search field', () => {
    let now;

    beforeEach(() => {
      // The debounce reads Date.now, which the fake timers of Jest 23 leave real
      jest.useFakeTimers();
      now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
    });

    afterEach(() => {
      Date.now.mockRestore();
      jest.useRealTimers();
    });

    it('adds one history entry when the search is typed, then submitted', () => {
      renderPage({ url: '/plugins' });
      const form = div.querySelector('form');
      const input = form.querySelector('input[name="value"]');
      const setInputValue = Object
        .getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

      act(() => {
        setInputValue.call(input, 'Gx');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
      // The search field submits the typed value again once its debounce delay is over
      now += SEARCH_DEBOUNCE_WAIT_MS;
      act(() => {
        jest.advanceTimersByTime(SEARCH_DEBOUNCE_WAIT_MS);
      });

      expect(location.search).toBe('?brand=Gx');
      expect(history.length).toBe(2);
    });
  });

  it('renders without props', () => {
    expect(() => {
      act(() => {
        ReactDOM.render(<MemoryRouter><PluginsPage /></MemoryRouter>, div);
      });
    }).not.toThrow();
    expect(div.querySelector('.plugin')).toBeNull();
  });

  it('ignores the unknown parameters and an invalid page of the URL', () => {
    renderPage({ url: '/plugins?utm_source=x&page=abc' });

    expect(fetchPlugins).toHaveBeenCalledWith(1, 10);
    expect(findPlugins).not.toHaveBeenCalled();
  });
});
