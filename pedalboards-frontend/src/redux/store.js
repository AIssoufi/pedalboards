// Dependencies
import { configureStore } from '@reduxjs/toolkit';

// Constants
import { PLUGINS_SLICE_NAME } from './plugins/constants';

// Reducers
import pluginsReducer from './plugins/slice';

/**
 * Creates the store of the app. Redux Toolkit adds the thunk middleware, and in development
 * only the checks that the state is never mutated nor holds values that are not serializable.
 *
 * @param {Object} [params]
 * @param {Object} [params.preloadedState] - State to start from, for the tests.
 * @returns The store.
 */
const setupStore = ({ preloadedState } = {}) => configureStore({
  reducer: {
    [PLUGINS_SLICE_NAME]: pluginsReducer
  },
  preloadedState,
  // The Redux DevTools extension sees the store in development only, never in production
  devTools: import.meta.env.DEV
});

export default setupStore;
