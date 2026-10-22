// Dependencies
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

// Services
import { PedalboardService } from '../../services';

// Constants
import { LOAD_STATUS, PLUGINS_SLICE_NAME } from './constants';

// Utils
import { hasPluginFilters, toPluginsPage } from './utils';

/**
 * State of the plugins page: the plugins of the page shown, the number of pages of the results,
 * where their loading stands, and the message of its last failure.
 *
 * @typedef {Object} PluginsState
 * @property {Object[]} plugins - Plugins of the page shown.
 * @property {number} pageCount - Number of pages of the results.
 * @property {string} status - One of LOAD_STATUS.
 * @property {string|null} error - Message of the failed request, null otherwise.
 * @property {string|null} requestId - Id of the request whose answer the state waits for.
 */

/** @type {PluginsState} */
const initialState = {
  plugins: [],
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
 * Reads what the plugins page shows from the store.
 *
 * @param {Object} rootState - State of the store.
 * @returns {{ plugins: Object[], pageCount: number, isLoading: boolean, hasFailed: boolean }}
 * The plugins and the number of pages, whether a page is loading (or none was asked yet), and
 * whether the last request failed.
 */
const selectPluginsPage = createSelector(
  rootState => rootState[PLUGINS_SLICE_NAME],
  ({ plugins, pageCount, status }) => ({
    plugins,
    pageCount,
    isLoading: status === LOAD_STATUS.IDLE || status === LOAD_STATUS.LOADING,
    hasFailed: status === LOAD_STATUS.FAILED
  })
);

export { initialState, loadPlugins, selectPluginsPage };
export default pluginsSlice.reducer;
