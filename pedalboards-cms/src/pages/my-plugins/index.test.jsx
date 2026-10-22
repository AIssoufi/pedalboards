// Dependencies
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

// Services
import { PedalboardService } from 'services';

// Utils
import { flushPromises, render } from 'utils/testing';

// Constants
import { PAGE_SIZE } from './constants';

// Components
import MyPlugins from './index';

const ALL_PLUGINS = {
  data: [{ _id: 'gate', name: 'Gate' }, { _id: 'reverb', name: 'Reverb' }],
  count: 2,
  currentPage: 1,
  numberPages: 1
};

const FOUND_PLUGINS = {
  data: [{ _id: 'gate', name: 'Gate' }],
  count: 1,
  currentPage: 1,
  numberPages: 1
};

const findPluginsOnTwoPages = (searchParams, page) => Promise.resolve({
  ...FOUND_PLUGINS, count: 12, currentPage: page, numberPages: 2
});

const getPluginsOnPages = ({ count, numberPages }) => page => Promise.resolve({
  ...ALL_PLUGINS, count, currentPage: page, numberPages
});

const getTwoPluginsOnTwoPages = getPluginsOnPages({ count: 2, numberPages: 2 });

const getPluginsOnThreePages = getPluginsOnPages({ count: 25, numberPages: 3 });

const EMPTY_STATE_TEXT = 'Vous n\'avez ajouté aucun plugin';

const renderMyPlugins = props => render(
  <MemoryRouter>
    <MyPlugins {...props} />
  </MemoryRouter>
);

const rerenderMyPlugins = ({ view: renderedView, props }) => renderedView.rerender(
  <MemoryRouter>
    <MyPlugins {...props} />
  </MemoryRouter>
);

const readTitles = container => Array.from(
  container.querySelectorAll('.plugin .title'),
  title => title.textContent
);

const readErrorText = (container) => {
  const error = container.querySelector('[role="alert"]');

  return error && error.textContent;
};

const clickPageButton = ({ container, label }) => {
  const pageButton = Array.from(container.querySelectorAll('.navigation button'))
    .find(button => button.textContent === label);

  act(() => {
    pageButton.click();
  });
};

const clickNavigation = ({ container, selector }) => {
  act(() => {
    container.querySelector(selector).click();
  });
};

const clickFirstDeleteButton = (container) => {
  act(() => {
    container.querySelector('.plugin button').click();
  });
};

const readSearchCalls = () => PedalboardService.findPlugins.mock.calls.map(
  ([searchParams, page, pageSize]) => [searchParams.toString(), page, pageSize]
);

const isPropTypeWarning = ([message]) => String(message).includes('Failed prop type');

const readPropTypeWarnings = () => console.error.mock.calls.filter(isPropTypeWarning);

describe('MyPlugins', () => {
  let view;

  beforeEach(() => {
    jest.spyOn(console, 'error');
    jest.spyOn(PedalboardService, 'getPlugins').mockResolvedValue(ALL_PLUGINS);
    jest.spyOn(PedalboardService, 'findPlugins').mockResolvedValue(FOUND_PLUGINS);
  });

  afterEach(() => {
    if (view) view.unmount();
    view = undefined;
    jest.restoreAllMocks();
  });

  it('lists the plugins that match the search of the address', async () => {
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();

    const [[searchParams, page]] = PedalboardService.findPlugins.mock.calls;

    expect(searchParams.get('name')).toBe('gate');
    expect(page).toBe(1);
    expect(PedalboardService.getPlugins).not.toHaveBeenCalled();
    expect(readTitles(view.container)).toEqual(['Gate']);
  });

  it('lists every plugin without a search', async () => {
    view = renderMyPlugins({ location: { search: '' } });
    await flushPromises();

    expect(PedalboardService.findPlugins).not.toHaveBeenCalled();
    expect(readTitles(view.container)).toEqual(['Gate', 'Reverb']);
  });

  it('lists every plugin when the search has no parameter', async () => {
    view = renderMyPlugins({ location: { search: '?' } });
    await flushPromises();

    expect(PedalboardService.findPlugins).not.toHaveBeenCalled();
    expect(readTitles(view.container)).toEqual(['Gate', 'Reverb']);
  });

  it('shows the empty state when no plugin matches the search', async () => {
    PedalboardService.findPlugins.mockResolvedValue({ data: [], count: 0, numberPages: 0 });
    view = renderMyPlugins({ location: { search: '?name=nothing' } });
    await flushPromises();

    expect(readTitles(view.container)).toEqual([]);
    expect(view.container.textContent).toContain(EMPTY_STATE_TEXT);
  });

  it('shows the empty state when the response has no data', async () => {
    PedalboardService.findPlugins.mockResolvedValue({});
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();

    expect(view.container.textContent).toContain(EMPTY_STATE_TEXT);
    expect(readPropTypeWarnings()).toEqual([]);
  });

  it('shows the message of a failed search', async () => {
    PedalboardService.findPlugins.mockRejectedValue(
      new Error('Le service des plugins ne répond pas')
    );
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();

    expect(readErrorText(view.container)).toBe('Le service des plugins ne répond pas');
    expect(view.container.textContent).toContain(EMPTY_STATE_TEXT);
  });

  it('keeps the list and shows the message of a failed delete', async () => {
    jest.spyOn(PedalboardService, 'deletePlugin').mockRejectedValue(new Error('Plugin non trouvé'));
    view = renderMyPlugins({ location: { search: '' } });
    await flushPromises();
    clickFirstDeleteButton(view.container);
    await flushPromises();

    expect(readErrorText(view.container)).toBe('Plugin non trouvé');
    expect(readTitles(view.container)).toEqual(['Gate', 'Reverb']);
  });

  it('keeps the search when it goes to another page', async () => {
    PedalboardService.findPlugins.mockImplementation(findPluginsOnTwoPages);
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();
    clickPageButton({ container: view.container, label: '2' });
    await flushPromises();

    expect(readSearchCalls()).toEqual([['name=gate', 1, PAGE_SIZE], ['name=gate', 2, PAGE_SIZE]]);
    expect(PedalboardService.getPlugins).not.toHaveBeenCalled();
  });

  it('lists every plugin of another page without a search', async () => {
    PedalboardService.getPlugins.mockResolvedValue({ ...ALL_PLUGINS, count: 12, numberPages: 2 });
    view = renderMyPlugins({ location: { search: '' } });
    await flushPromises();
    clickPageButton({ container: view.container, label: '2' });
    await flushPromises();

    expect(PedalboardService.getPlugins.mock.calls).toEqual([[1, PAGE_SIZE], [2, PAGE_SIZE]]);
    expect(PedalboardService.findPlugins).not.toHaveBeenCalled();
  });

  it('lists the first page of a new search of the address', async () => {
    PedalboardService.findPlugins.mockImplementation(findPluginsOnTwoPages);
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();
    clickPageButton({ container: view.container, label: '2' });
    await flushPromises();
    PedalboardService.findPlugins.mockResolvedValue({
      data: [{ _id: 'reverb', name: 'Reverb' }], count: 1, currentPage: 1, numberPages: 1
    });
    rerenderMyPlugins({ view, props: { location: { search: '?name=reverb' } } });
    await flushPromises();

    expect(readSearchCalls()).toEqual([
      ['name=gate', 1, PAGE_SIZE],
      ['name=gate', 2, PAGE_SIZE],
      ['name=reverb', 1, PAGE_SIZE]
    ]);
    expect(readTitles(view.container)).toEqual(['Reverb']);
  });

  it('lists every plugin once the search leaves the address', async () => {
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();
    rerenderMyPlugins({ view, props: { location: { search: '' } } });
    await flushPromises();

    expect(PedalboardService.getPlugins.mock.calls).toEqual([[1, PAGE_SIZE]]);
    expect(readTitles(view.container)).toEqual(['Gate', 'Reverb']);
  });

  it('keeps the plugins of the new search when the previous one answers last', async () => {
    let answerPreviousSearch;
    PedalboardService.findPlugins.mockReturnValueOnce(new Promise((resolve) => {
      answerPreviousSearch = resolve;
    }));
    view = renderMyPlugins({ location: { search: '?name=reverb' } });
    rerenderMyPlugins({ view, props: { location: { search: '?name=gate' } } });
    await flushPromises();
    answerPreviousSearch({ data: [{ _id: 'reverb', name: 'Reverb' }], count: 1, numberPages: 1 });
    await flushPromises();

    expect(readTitles(view.container)).toEqual(['Gate']);
  });

  it('keeps the error of the new search when the previous one fails last', async () => {
    let failPreviousSearch;
    PedalboardService.findPlugins.mockReturnValueOnce(new Promise((resolve, reject) => {
      failPreviousSearch = reject;
    }));
    view = renderMyPlugins({ location: { search: '?name=reverb' } });
    rerenderMyPlugins({ view, props: { location: { search: '?name=gate' } } });
    await flushPromises();
    failPreviousSearch(new Error('La requête a échoué (500)'));
    await flushPromises();

    expect(readErrorText(view.container)).toBeNull();
    expect(readTitles(view.container)).toEqual(['Gate']);
  });

  it('loads nothing again when the search of the address stays the same', async () => {
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();
    rerenderMyPlugins({ view, props: { location: { search: '?name=gate' } } });
    await flushPromises();

    expect(PedalboardService.findPlugins).toHaveBeenCalledTimes(1);
  });

  it('goes to the last page when it holds fewer plugins than pages', async () => {
    PedalboardService.getPlugins.mockImplementation(getTwoPluginsOnTwoPages);
    view = renderMyPlugins({ location: { search: '' } });
    await flushPromises();
    clickPageButton({ container: view.container, label: '2' });
    await flushPromises();

    expect(PedalboardService.getPlugins.mock.calls).toEqual([[1, PAGE_SIZE], [2, PAGE_SIZE]]);
  });

  it('loads no page after the last one', async () => {
    PedalboardService.getPlugins.mockImplementation(getPluginsOnThreePages);
    view = renderMyPlugins({ location: { search: '' } });
    await flushPromises();
    clickPageButton({ container: view.container, label: '3' });
    await flushPromises();
    clickNavigation({ container: view.container, selector: '.next-page' });
    await flushPromises();

    expect(PedalboardService.getPlugins.mock.calls).toEqual([[1, PAGE_SIZE], [3, PAGE_SIZE]]);
  });

  it('loads no page before the first one', async () => {
    PedalboardService.getPlugins.mockImplementation(getPluginsOnThreePages);
    view = renderMyPlugins({ location: { search: '' } });
    await flushPromises();
    clickNavigation({ container: view.container, selector: '.previous-page' });
    await flushPromises();

    expect(PedalboardService.getPlugins.mock.calls).toEqual([[1, PAGE_SIZE]]);
  });

  it('reloads the searched plugins of the page after a delete', async () => {
    jest.spyOn(PedalboardService, 'deletePlugin').mockResolvedValue(ALL_PLUGINS);
    PedalboardService.findPlugins.mockImplementation(findPluginsOnTwoPages);
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();
    clickPageButton({ container: view.container, label: '2' });
    await flushPromises();
    clickFirstDeleteButton(view.container);
    await flushPromises();

    expect(PedalboardService.deletePlugin).toHaveBeenCalledWith('gate', 2, PAGE_SIZE);
    expect(readSearchCalls()).toEqual([
      ['name=gate', 1, PAGE_SIZE],
      ['name=gate', 2, PAGE_SIZE],
      ['name=gate', 2, PAGE_SIZE]
    ]);
    expect(readTitles(view.container)).toEqual(['Gate']);
  });

  it('shows the message of a failed reload after a delete', async () => {
    jest.spyOn(PedalboardService, 'deletePlugin').mockResolvedValue(ALL_PLUGINS);
    view = renderMyPlugins({ location: { search: '?name=gate' } });
    await flushPromises();
    PedalboardService.findPlugins.mockRejectedValue(new Error('La requête a échoué (500)'));
    clickFirstDeleteButton(view.container);
    await flushPromises();

    expect(readErrorText(view.container)).toBe('La requête a échoué (500)');
  });

  it('shows no message once the plugins are loaded', async () => {
    view = renderMyPlugins({ location: { search: '' } });
    await flushPromises();

    expect(readErrorText(view.container)).toBeNull();
  });

  it('lists every plugin without a location', async () => {
    view = renderMyPlugins();
    await flushPromises();

    expect(readTitles(view.container)).toEqual(['Gate', 'Reverb']);
  });
});
