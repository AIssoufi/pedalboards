// Store
import setupStore from '../store';

// Test utils
import { jsonResponse } from '../../test-utils/fetch';

// Slice
import { loadPlugins, selectPluginsPage } from './slice';

const PLUGIN = { _id: 'abgate', label: 'Gate' };
const PAGE_SIZE = 10;
const SERVER_ERROR_STATUS = 500;

const fetchedUrl = (index = 0) => new URL(String(window.fetch.mock.calls[index][0]));

/**
 * Holds each fetch until the test answers it.
 *
 * @returns {Function[]} The function that answers each fetch with a body, in the order of the
 * fetches.
 */
const holdFetch = () => {
  const answers = [];
  vi.spyOn(window, 'fetch').mockImplementation(() => new Promise((resolve) => {
    answers.push(body => resolve(jsonResponse({ body })));
  }));
  return answers;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('loadPlugins', () => {
  it('is loading before the first request, as the page shows the loader at once', () => {
    expect(selectPluginsPage(setupStore().getState())).toEqual({
      plugins: [], pageCount: 0, isLoading: true, hasFailed: false
    });
  });

  it('loads a page of all the plugins without filters', async () => {
    vi.spyOn(window, 'fetch')
      .mockResolvedValue(jsonResponse({ body: { data: [PLUGIN], count: 1, numberPages: 1 } }));
    const store = setupStore();

    const request = store.dispatch(loadPlugins({ page: 2, pageSize: PAGE_SIZE }));
    expect(selectPluginsPage(store.getState()).isLoading).toBe(true);
    await request;

    expect(selectPluginsPage(store.getState())).toEqual({
      plugins: [PLUGIN], pageCount: 1, isLoading: false, hasFailed: false
    });
    expect(fetchedUrl().searchParams.get('page')).toBe('2');
    expect(fetchedUrl().searchParams.get('pagesize')).toBe(String(PAGE_SIZE));
    expect(fetchedUrl().search).not.toContain('filterby');
  });

  it('filters the plugins on the fields of the filters', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(jsonResponse({ body: { data: [PLUGIN] } }));
    const store = setupStore();

    await store.dispatch(loadPlugins({
      filters: new URLSearchParams('categories=Delay'), page: 1, pageSize: PAGE_SIZE
    }));

    expect(fetchedUrl().searchParams.get('filterby[categories]')).toBe('Delay');
    expect(selectPluginsPage(store.getState()).plugins).toEqual([PLUGIN]);
  });

  it.each([
    ['the network fails', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['the API answers an error', () => Promise.resolve(jsonResponse({ status: SERVER_ERROR_STATUS }))]
  ])('stores the failure when %s, without throwing', async (description, answer) => {
    vi.spyOn(window, 'fetch').mockImplementation(answer);
    const store = setupStore();

    const action = await store.dispatch(loadPlugins({ page: 1, pageSize: PAGE_SIZE }));

    expect(action.type).toBe(loadPlugins.rejected.type);
    expect(selectPluginsPage(store.getState())).toMatchObject({ isLoading: false, hasFailed: true });
    expect(store.getState().plugins.error).toContain('/api/plugins');
  });

  it('keeps the plugins of the last page when a request fails', async () => {
    vi.spyOn(window, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ body: { data: [PLUGIN], numberPages: 1 } }))
      .mockRejectedValueOnce(new TypeError('offline'));
    const store = setupStore();

    await store.dispatch(loadPlugins({ page: 1, pageSize: PAGE_SIZE }));
    await store.dispatch(loadPlugins({ page: 2, pageSize: PAGE_SIZE }));

    expect(selectPluginsPage(store.getState())).toMatchObject({
      plugins: [PLUGIN], pageCount: 1, hasFailed: true
    });
  });

  it('clears the failure when a new request starts', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new TypeError('offline'));
    const store = setupStore();
    await store.dispatch(loadPlugins({ page: 1, pageSize: PAGE_SIZE }));

    store.dispatch(loadPlugins({ page: 1, pageSize: PAGE_SIZE }));

    expect(selectPluginsPage(store.getState())).toMatchObject({ isLoading: true, hasFailed: false });
    expect(store.getState().plugins.error).toBeNull();
  });

  it('ignores the late answer of an earlier request', async () => {
    const answers = holdFetch();
    const store = setupStore();
    const first = store.dispatch(loadPlugins({ page: 1, pageSize: PAGE_SIZE }));
    const second = store.dispatch(loadPlugins({ page: 2, pageSize: PAGE_SIZE }));

    answers[1]({ data: [PLUGIN], numberPages: 2 });
    await second;
    answers[0]({ data: [], numberPages: 1 });
    await first;

    expect(selectPluginsPage(store.getState())).toMatchObject({ plugins: [PLUGIN], pageCount: 2 });
  });

  it('waits for no answer once its request is aborted, and shows no failure', async () => {
    holdFetch();
    const store = setupStore();

    const request = store.dispatch(loadPlugins({ page: 1, pageSize: PAGE_SIZE }));
    request.abort();
    await request;

    expect(store.getState().plugins).toMatchObject({ status: 'idle', error: null, requestId: null });
  });

  it('ignores the abort of an earlier request', async () => {
    const answers = holdFetch();
    const store = setupStore();
    const first = store.dispatch(loadPlugins({ page: 1, pageSize: PAGE_SIZE }));
    const second = store.dispatch(loadPlugins({ page: 2, pageSize: PAGE_SIZE }));

    first.abort();
    await first;
    expect(selectPluginsPage(store.getState()).isLoading).toBe(true);
    answers[1]({ data: [PLUGIN], numberPages: 2 });
    await second;

    expect(selectPluginsPage(store.getState())).toMatchObject({ plugins: [PLUGIN], isLoading: false });
  });

  it('gives an empty page for an answer without plugins', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(jsonResponse({ body: { data: 'none' } }));
    const store = setupStore();

    await store.dispatch(loadPlugins({ page: 1, pageSize: PAGE_SIZE }));

    expect(selectPluginsPage(store.getState())).toMatchObject({ plugins: [], pageCount: 0 });
  });
});
