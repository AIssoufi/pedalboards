// Constants
import { PLUGIN_DETAILS_PATHNAME, PLUGINS_PATHNAME } from '../../constants/routes';

// Utils
import { isNonBlankText } from '../text';

/**
 * Builds the path of the page of one plugin, with its id encoded so that a slash, a space or a
 * `?` in it stays inside the `id` parameter of the route of that page.
 *
 * @param {*} id - Identifier of the plugin, read from the API.
 * @returns {string} The path of its page, or the one of the list when the id is not a text with
 *   a character other than a space, since no plugin page matches it.
 * @example
 * buildPluginPathname('auto-wah'); // '/plugin/auto-wah'
 * buildPluginPathname('a/b c'); // '/plugin/a%2Fb%20c'
 * buildPluginPathname(''); // '/plugins'
 */
const buildPluginPathname = id => (
  isNonBlankText(id) ? `${PLUGIN_DETAILS_PATHNAME}/${encodeURIComponent(id)}` : PLUGINS_PATHNAME
);

export { buildPluginPathname };
