// Constants
import { NEW_TAB_NOTE, UNTITLED_PLUGIN_TEXT } from './constants';

/**
 * Trims a text, and gives an empty text for any other value.
 * @param {*} value value to read
 * @returns {string} the trimmed text, or `''` when the value is not a text
 */
const toTrimmedText = value => (typeof value === 'string' ? value.trim() : '');

/**
 * Gives the names that a plugin of the list shows: its label as the title, since the API sorts the
 * list on it and the store prints it on its cards, and its name below when it says something else.
 * @param {Object} [plugin]
 * @param {*} [plugin.label] label of the plugin, as `Ambience`
 * @param {*} [plugin.name] name of the plugin, as `MDA Ambience`
 * @returns {{ title: string, subtitle: string }} the trimmed label as the title, or the trimmed
 *   name without a label, or `UNTITLED_PLUGIN_TEXT` without either; the trimmed name as the
 *   subtitle when it differs from the title, otherwise an empty text
 *
 * @example
 * toPluginNames({ label: 'Ambience', name: 'MDA Ambience' });
 * // { title: 'Ambience', subtitle: 'MDA Ambience' }
 * toPluginNames({ name: 'Gate' }); // { title: 'Gate', subtitle: '' }
 * toPluginNames(); // { title: 'Untitled plugin', subtitle: '' }
 */
export const toPluginNames = ({ label, name } = {}) => {
  const trimmedName = toTrimmedText(name);
  const title = toTrimmedText(label) || trimmedName || UNTITLED_PLUGIN_TEXT;
  const isNameAlreadyTitle = trimmedName === title;

  return { title, subtitle: isNameAlreadyTitle ? '' : trimmedName };
};

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
  const trimmedName = toTrimmedText(pluginName);
  const newTabNote = opensInNewTab ? NEW_TAB_NOTE : '';

  // Leaves the missing parts out, so that no space stands for them
  return [action, trimmedName, newTabNote].filter(Boolean).join(' ');
};
