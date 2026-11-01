// Constants
import { EMPTY_STATE_TEXT } from '../../constants/search';
import { NO_STATUS_TEXT } from './constants';

/**
 * Builds what the status region of the plugins page reads to a screen reader. A failed request
 * has its own alert, and a list still loading has no result to read, so neither reads anything.
 *
 * @param {Object} params
 * @param {number} [params.pluginCount=0] - Number of plugins of the results, on all their pages.
 * @param {boolean} [params.isLoading=false] - Whether the plugins are loading.
 * @param {boolean} [params.hasFailed=false] - Whether the last request failed.
 * @returns {string} The number of plugins, the empty state, or an empty text.
 * @example
 * buildResultsStatus({ pluginCount: 12 }); // '12 plugins found'
 * buildResultsStatus({ pluginCount: 1 }); // '1 plugin found'
 * buildResultsStatus({ pluginCount: 0 }); // 'No plugin matches your search!'
 */
const buildResultsStatus = ({ pluginCount = 0, isLoading = false, hasFailed = false } = {}) => {
  if (isLoading || hasFailed) return NO_STATUS_TEXT;
  if (pluginCount === 0) return EMPTY_STATE_TEXT;

  const noun = pluginCount === 1 ? 'plugin' : 'plugins';

  return `${pluginCount} ${noun} found`;
};

export { buildResultsStatus };
