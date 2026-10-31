// Dependencies
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

// Services
import { PedalboardService } from '../../services';

// Constants
import { LOAD_STATUS, PLUGINS_SLICE_NAME } from './constants';

// Utils
import { hasPluginFilters, toPluginsPage } from './utils';

/**
 * State of the plugins page: the plugins of the page shown, the query string they answer, the
 * number of pages of the results, where their loading stands, and the message of its last failure.
 *
 * @typedef {Object} PluginsState
 * @property {Object[]} plugins - Plugins of the page shown.
 * @property {string|null} heldSearch - Query string of the URL that `plugins` answer, null before
 *   the first answer, or when the request named no URL.
 * @property {number} pageCount - Number of pages of the results.
 * @property {string} status - One of LOAD_STATUS.
 * @property {string|null} error - Message of the failed request, null otherwise.
 * @property {string|null} requestId - Id of the request whose answer the state waits for.
 */

/** @type {PluginsState} */
const initialState = {
  plugins: [],
  heldSearch: null,
  pageCount: 0,
  status: LOAD_STATUS.IDLE,
  error: null,
  requestId: null
};

/**
 * Loads a page of plugins: all of them without filters, or those matching the filters.
 *
 * @param {Object} params
 * @param {URLSearchParams} [params.filters] - Fields and values the plugins must match.
 * @param {number} params.page - Page to load, from 1.
 * @param {number} params.pageSize - Number of plugins on each page.
 * @param {string} [params.search] - Query string of the URL asking for them, which the store keeps
 *   with the answer, so that `selectPluginsPage` can tell the list of that URL is held.
 * @returns The thunk, whose fulfilled action holds the page read by `toPluginsPage`.
 */
const loadPlugins = createAsyncThunk(
  `${PLUGINS_SLICE_NAME}/load`,
  async ({ filters, page, pageSize }) => {
    const answer = hasPluginFilters(filters)
      ? await PedalboardService.findPlugins({ filters, page, pageSize })
      : await PedalboardService.getPlugins({ page, pageSize });

    return toPluginsPage(answer);
  }
);

// Only the answer of the last request changes the state: a late one for an older search is lost
const isCurrentRequest = ({ state, action }) => action.meta.requestId === state.requestId;

const pluginsSlice = createSlice({
  name: PLUGINS_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPlugins.pending, (state, action) => {
        state.status = LOAD_STATUS.LOADING;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(loadPlugins.fulfilled, (state, action) => {
        if (!isCurrentRequest({ state, action })) return;

        state.plugins = action.payload.plugins;
        state.heldSearch = action.meta.arg.search ?? null;
        state.pageCount = action.payload.pageCount;
        state.status = LOAD_STATUS.SUCCEEDED;
        state.requestId = null;
      })
      .addCase(loadPlugins.rejected, (state, action) => {
        if (!isCurrentRequest({ state, action })) return;

        // The page left or changed its search: no answer is awaited any more, and none failed
        const isAborted = action.meta.aborted;
        state.status = isAborted ? LOAD_STATUS.IDLE : LOAD_STATUS.FAILED;
        state.error = isAborted ? null : action.error.message ?? null;
        state.requestId = null;
      });
  }
});

/**
 * Reads what the plugins page shows from the store. The list of a URL the store still holds, as
 * when the visitor comes back from a plugin, stays on screen while it reloads, with no loader and
 * no failure: the page keeps its height, so the browser can restore the scroll position.
 *
 * @param {Object} params
 * @param {Object} params.rootState - State of the store.
 * @param {string} [params.search] - Query string of the URL shown.
 * @returns {{ plugins: Object[], pageCount: number, isLoading: boolean, hasFailed: boolean }}
 * The plugins and the number of pages, whether the page shows the loader (a list that is not held
 * is loading, or none was asked yet), and whether it shows the failure of its last request.
 */
const selectPluginsPage = createSelector(
  [({ rootState }) => rootState[PLUGINS_SLICE_NAME], ({ search }) => search],
  ({
    plugins, heldSearch, pageCount, status
  }, search) => {
    const isListHeld = heldSearch !== null && heldSearch === search;
    const isWaiting = status === LOAD_STATUS.IDLE || status === LOAD_STATUS.LOADING;

    return {
      plugins,
      pageCount,
      isLoading: !isListHeld && isWaiting,
      hasFailed: !isListHeld && status === LOAD_STATUS.FAILED
    };
  }
);

export { initialState, loadPlugins, selectPluginsPage };
export default pluginsSlice.reducer;
