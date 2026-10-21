/** Name of the plugins slice, the key of its state in the store and the prefix of its actions */
export const PLUGINS_SLICE_NAME = 'plugins';

/**
 * Steps of the loading of a page of plugins: nothing asked yet, a request running, its answer
 * shown, or its failure.
 */
export const LOAD_STATUS = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
});
