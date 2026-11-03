// Constants
import { NEW_TAB_NOTE } from './constants';

/**
 * Tells whether a value is a text with a character other than a space.
 * @param {*} value value to check
 * @returns {boolean} `true` for a text that is not empty once trimmed
 */
export const isFilledText = value => typeof value === 'string' && value.trim() !== '';

/**
 * Gives the accessible name of an action on a plugin of the list, so that each "View", "Edit" or
 * "Delete" tells which plugin it acts on. It starts with the visible text of the action.
 * @param {Object} [params]
 * @param {string} [params.action=''] visible text of the action
 * @param {*} [params.pluginName] name of the plugin
 * @param {boolean} [params.opensInNewTab=false] whether the action opens a new tab, which the
 *   name then says
 * @returns {string} the action and the trimmed name, or the action alone when the name is not a
 *   text with a character other than a space, followed by `NEW_TAB_NOTE` for a new tab; the
 *   missing parts are left out with their space
 *
 * @example
 * toPluginActionLabel({ action: 'Edit', pluginName: 'Gate' }); // 'Edit Gate'
 * toPluginActionLabel({ action: 'Edit' }); // 'Edit'
 * toPluginActionLabel({ action: 'View', pluginName: 'Gate', opensInNewTab: true });
 * // 'View Gate (new tab)'
 */
export const toPluginActionLabel = ({ action = '', pluginName, opensInNewTab = false } = {}) => {
  const trimmedName = typeof pluginName === 'string' ? pluginName.trim() : '';
  const newTabNote = opensInNewTab ? NEW_TAB_NOTE : '';

  // Leaves the missing parts out, so that no space stands for them
  return [action, trimmedName, newTabNote].filter(Boolean).join(' ');
};
