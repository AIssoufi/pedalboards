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

const getPluginsOnThreePages = page => Promise.resolve({
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

    expect(PedalboardService.getPlugins).toHaveBeenCalledWith(1, PAGE_SIZE);
    expect(hook.result.current).toMatchObject({ plugins: [GATE], currentPage: 1, pageCount: 3 });
  });

  it('loads the first page of the plugins that match the search', async () => {
    hook = renderPluginList({ search: '?name=reverb' });
    await flushPromises();

    const [[searchParams, page, pageSize]] = PedalboardService.findPlugins.mock.calls;

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

  it('loads the first page again when the search changes', async () => {
    hook = renderPluginList();
    await flushPromises();
    act(() => hook.result.current.goToPage(3));
    await flushPromises();
    hook.rerender({ search: '?name=reverb' });
    await flushPromises();

    expect(PedalboardService.findPlugins.mock.calls[0][1]).toBe(1);
    expect(hook.result.current).toMatchObject({ plugins: [REVERB], currentPage: 1 });
  });

  it('goes to the last page', async () => {
    hook = renderPluginList();
    await flushPromises();
    act(() => hook.result.current.goToPage(3));
    await flushPromises();

    expect(PedalboardService.getPlugins).toHaveBeenLastCalledWith(3, PAGE_SIZE);
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

    expect(PedalboardService.deletePlugin).toHaveBeenCalledWith('gate', 2, PAGE_SIZE);
    expect(PedalboardService.getPlugins).toHaveBeenLastCalledWith(2, PAGE_SIZE);
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
