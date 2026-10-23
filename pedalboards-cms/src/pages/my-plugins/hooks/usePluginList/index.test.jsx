// Dependencies
import React from 'react';
import { act } from 'react-dom/test-utils';

// Services
import { PedalboardService } from 'services';

// Utils
import { flushPromises, render } from 'utils/testing';

// Constants
import { PAGE_SIZE } from '../../constants';

// Hooks
import usePluginList from './index';

const GATE = { _id: 'gate', name: 'Gate' };

const REVERB = { _id: 'reverb', name: 'Reverb' };

const getPluginsOnThreePages = ({ page }) => Promise.resolve({
  data: [GATE], count: 25, currentPage: page, numberPages: 3
});

const findPluginsOnOnePage = () => Promise.resolve({
  data: [REVERB], count: 1, currentPage: 1, numberPages: 1
});

// Renders the hook in a component and keeps its last result in `result.current`
const renderPluginList = (params) => {
  const result = {};
  const Probe = (props) => {
    result.current = usePluginList(props);

    return null;
  };
  const view = render(<Probe {...params} />);

  return {
    result,
    rerender: nextParams => view.rerender(<Probe {...nextParams} />),
    unmount: view.unmount
  };
};

describe('usePluginList', () => {
  let hook;

  beforeEach(() => {
    jest.spyOn(console, 'error');
    jest.spyOn(PedalboardService, 'getPlugins').mockImplementation(getPluginsOnThreePages);
    jest.spyOn(PedalboardService, 'findPlugins').mockImplementation(findPluginsOnOnePage);
    jest.spyOn(PedalboardService, 'deletePlugin').mockResolvedValue({});
  });

  afterEach(() => {
    if (hook) hook.unmount();
    hook = undefined;
    jest.restoreAllMocks();
  });

  it('starts with no plugin, on the first page of no page', () => {
    hook = renderPluginList();

    expect(hook.result.current).toMatchObject({
      plugins: [], currentPage: 1, pageCount: 0, errorMessage: ''
    });
  });

  it('loads the first page of every plugin without any params', async () => {
    hook = renderPluginList();
    await flushPromises();

    expect(PedalboardService.getPlugins).toHaveBeenCalledWith({ page: 1, pageSize: PAGE_SIZE });
    expect(hook.result.current).toMatchObject({ plugins: [GATE], currentPage: 1, pageCount: 3 });
  });

  it('loads the first page of the plugins that match the search', async () => {
    hook = renderPluginList({ search: '?name=reverb' });
    await flushPromises();

    const [[{ searchParams, page, pageSize }]] = PedalboardService.findPlugins.mock.calls;

    expect(searchParams.get('name')).toBe('reverb');
    expect([page, pageSize]).toEqual([1, PAGE_SIZE]);
    expect(hook.result.current.plugins).toEqual([REVERB]);
  });

  it('loads every plugin for a search without any parameter', async () => {
    hook = renderPluginList({ search: '?' });
    await flushPromises();

    expect(PedalboardService.findPlugins).not.toHaveBeenCalled();
    expect(hook.result.current.plugins).toEqual([GATE]);
  });

  it('gives neutral values for a response without data', async () => {
    PedalboardService.getPlugins.mockResolvedValue({});
    hook = renderPluginList();
    await flushPromises();

    expect(hook.result.current).toMatchObject({ plugins: [], currentPage: 1, pageCount: 0 });
  });

  it('gives neutral values for an empty response body', async () => {
    PedalboardService.getPlugins.mockResolvedValue(null);
    hook = renderPluginList();
    await flushPromises();

    expect(hook.result.current).toMatchObject({
      plugins: [], currentPage: 1, pageCount: 0, errorMessage: ''
    });
  });

  it.each([
    ['null', null],
    ['a text', 'Reverb'],
    ['a number', 42],
    ['an object', {}]
  ])('gives no plugin for data that is %s', async (label, data) => {
    PedalboardService.getPlugins.mockResolvedValue({
      data, count: 0, currentPage: 1, numberPages: 0
    });
    hook = renderPluginList();
    await flushPromises();

    expect(hook.result.current.plugins).toEqual([]);
  });

  it.each([
    ['null', null],
    ['a text', '3'],
    ['a number that is not whole', 2.5]
  ])('gives no page for a page count that is %s', async (label, numberPages) => {
    PedalboardService.getPlugins.mockResolvedValue({
      data: [GATE], count: 1, currentPage: 1, numberPages
    });
    hook = renderPluginList();
    await flushPromises();

    expect(PedalboardService.getPlugins).toHaveBeenCalledTimes(1);
    expect(hook.result.current).toMatchObject({ plugins: [GATE], pageCount: 0 });
  });

  it.each([
    ['null', null],
    ['a text', '2']
  ])('stays on the page asked for when the loaded page is %s', async (label, currentPage) => {
    hook = renderPluginList();
    await flushPromises();
    PedalboardService.getPlugins.mockResolvedValue({
      data: [GATE], count: 25, currentPage, numberPages: 3
    });
    act(() => hook.result.current.goToPage(2));
    await flushPromises();

    expect(hook.result.current.currentPage).toBe(2);
  });

  it('loads the first page again when the search changes', async () => {
    hook = renderPluginList();
    await flushPromises();
    act(() => hook.result.current.goToPage(3));
    await flushPromises();
    hook.rerender({ search: '?name=reverb' });
    await flushPromises();

    expect(PedalboardService.findPlugins.mock.calls[0][0].page).toBe(1);
    expect(hook.result.current).toMatchObject({ plugins: [REVERB], currentPage: 1 });
  });

  it('goes to the last page', async () => {
    hook = renderPluginList();
    await flushPromises();
    act(() => hook.result.current.goToPage(3));
    await flushPromises();

    expect(PedalboardService.getPlugins).toHaveBeenLastCalledWith({ page: 3, pageSize: PAGE_SIZE });
    expect(hook.result.current.currentPage).toBe(3);
  });

  it('loads no page out of the list', async () => {
    hook = renderPluginList();
    await flushPromises();
    [0, 4, -1, 1.5, NaN, undefined, '2'].forEach((page) => {
      act(() => hook.result.current.goToPage(page));
    });
    await flushPromises();

    expect(PedalboardService.getPlugins).toHaveBeenCalledTimes(1);
    expect(hook.result.current.currentPage).toBe(1);
  });

  it('keeps the plugins of the last request when an older one answers last', async () => {
    let answerPreviousSearch;
    PedalboardService.findPlugins.mockReturnValueOnce(new Promise((resolve) => {
      answerPreviousSearch = resolve;
    }));
    hook = renderPluginList({ search: '?name=gate' });
    hook.rerender({ search: '?name=reverb' });
    await flushPromises();
    answerPreviousSearch({ data: [GATE], count: 1, currentPage: 1, numberPages: 1 });
    await flushPromises();

    expect(hook.result.current.plugins).toEqual([REVERB]);
  });

  it('updates nothing when the plugins answer after the page is left', async () => {
    let answerPlugins;
    PedalboardService.getPlugins.mockReturnValueOnce(new Promise((resolve) => {
      answerPlugins = resolve;
    }));
    hook = renderPluginList();
    hook.unmount();
    hook = undefined;
    answerPlugins({ data: [GATE], count: 1, currentPage: 1, numberPages: 1 });
    await flushPromises();

    expect(console.error).not.toHaveBeenCalled();
  });

  it('updates nothing when a request fails after the page is left', async () => {
    let failPlugins;
    PedalboardService.getPlugins.mockReturnValueOnce(new Promise((resolve, reject) => {
      failPlugins = reject;
    }));
    hook = renderPluginList();
    hook.unmount();
    hook = undefined;
    failPlugins(new Error('La requête a échoué (500)'));
    await flushPromises();

    expect(console.error).not.toHaveBeenCalled();
  });

  it('reloads nothing when a delete succeeds after the page is left', async () => {
    let answerDelete;
    PedalboardService.deletePlugin.mockReturnValueOnce(new Promise((resolve) => {
      answerDelete = resolve;
    }));
    hook = renderPluginList();
    await flushPromises();
    act(() => hook.result.current.deletePlugin('gate'));
    hook.unmount();
    hook = undefined;
    answerDelete({});
    await flushPromises();

    expect(PedalboardService.getPlugins).toHaveBeenCalledTimes(1);
  });

  it('updates nothing when a delete fails after the page is left', async () => {
    let failDelete;
    PedalboardService.deletePlugin.mockReturnValueOnce(new Promise((resolve, reject) => {
      failDelete = reject;
    }));
    hook = renderPluginList();
    await flushPromises();
    // Forgets the act() warnings of the first load, which React 16.8 gives for any async update
    console.error.mockClear();
    act(() => hook.result.current.deletePlugin('gate'));
    hook.unmount();
    hook = undefined;
    failDelete(new Error('Plugin non trouvé'));
    await flushPromises();

    expect(console.error).not.toHaveBeenCalled();
  });

  it('gives the message of a failed request, then clears it once a page loads', async () => {
    PedalboardService.getPlugins.mockRejectedValueOnce(new Error('La requête a échoué (500)'));
    hook = renderPluginList();
    await flushPromises();

    expect(hook.result.current.errorMessage).toBe('La requête a échoué (500)');

    hook.rerender({ search: '?name=reverb' });
    await flushPromises();

    expect(hook.result.current.errorMessage).toBe('');
  });

  it('deletes a plugin, then loads its page again', async () => {
    hook = renderPluginList();
    await flushPromises();
    act(() => hook.result.current.goToPage(2));
    await flushPromises();
    act(() => hook.result.current.deletePlugin('gate'));
    await flushPromises();

    expect(PedalboardService.deletePlugin).toHaveBeenCalledWith({
      id: 'gate', page: 2, pageSize: PAGE_SIZE
    });
    expect(PedalboardService.getPlugins).toHaveBeenLastCalledWith({ page: 2, pageSize: PAGE_SIZE });
  });

  it('goes to the new last page when a delete empties the last one', async () => {
    hook = renderPluginList();
    await flushPromises();
    act(() => hook.result.current.goToPage(3));
    await flushPromises();
    PedalboardService.getPlugins.mockImplementation(({ page }) => Promise.resolve({
      data: page === 3 ? [] : [REVERB], count: 20, currentPage: page, numberPages: 2
    }));
    act(() => hook.result.current.deletePlugin('gate'));
    await flushPromises();

    expect(PedalboardService.getPlugins).toHaveBeenLastCalledWith({ page: 2, pageSize: PAGE_SIZE });
    expect(hook.result.current).toMatchObject({
      plugins: [REVERB], currentPage: 2, pageCount: 2
    });
  });

  it('stays on the first page when a delete empties the whole list', async () => {
    hook = renderPluginList();
    await flushPromises();
    PedalboardService.getPlugins.mockResolvedValue({
      data: [], count: 0, currentPage: 1, numberPages: 0
    });
    act(() => hook.result.current.deletePlugin('gate'));
    await flushPromises();

    expect(PedalboardService.getPlugins).toHaveBeenCalledTimes(2);
    expect(hook.result.current).toMatchObject({ plugins: [], currentPage: 1, pageCount: 0 });
  });

  it('loads the last page only once when the service gives a page past it', async () => {
    hook = renderPluginList();
    await flushPromises();
    act(() => hook.result.current.goToPage(3));
    await flushPromises();
    PedalboardService.getPlugins.mockResolvedValue({
      data: [], count: 20, currentPage: 3, numberPages: 2
    });
    act(() => hook.result.current.deletePlugin('gate'));
    await flushPromises();

    const callsAfterDelete = PedalboardService.getPlugins.mock.calls.slice(2);

    expect(callsAfterDelete).toEqual([
      [{ page: 3, pageSize: PAGE_SIZE }],
      [{ page: 2, pageSize: PAGE_SIZE }]
    ]);
  });

  it('keeps the plugins and gives the message of a failed delete', async () => {
    PedalboardService.deletePlugin.mockRejectedValue(new Error('Plugin non trouvé'));
    hook = renderPluginList();
    await flushPromises();
    act(() => hook.result.current.deletePlugin('gate'));
    await flushPromises();

    expect(hook.result.current).toMatchObject({
      plugins: [GATE], errorMessage: 'Plugin non trouvé'
    });
    expect(PedalboardService.getPlugins).toHaveBeenCalledTimes(1);
  });
});
