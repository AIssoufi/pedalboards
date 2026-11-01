// Pure helpers of the sitemap. They run in plain Node.js, which cannot import the helpers of `src`
// that hold imports without an extension: sitemap.test.mjs checks that the paths match them

// Constants
import {
  PLUGIN_DETAILS_PATHNAME,
  PLUGINS_PATHNAME,
  SITE_ORIGIN
} from '../src/constants/routes.js';
import { SITEMAP_NAMESPACE } from './constants.mjs';

// Utils
import { toPluginId } from '../../pedalboards-core-service/src/utils/plugin-id.js';

/**
 * Gives the id of the page of a seed plugin, as the seed migration makes it.
 *
 * @param {*} plugin - Record of data/plugins.json.
 * @returns {string} The id, or an empty string when the plugin has no name to make it from.
 */
const toSeedPluginId = plugin => toPluginId(String(plugin?.name ?? ''));

/**
 * Lists the addresses of the pages that search engines should read: the list of the plugins, then
 * the page of each plugin, in the order of the seed.
 *
 * @param {*} plugins - Records of data/plugins.json.
 * @returns {string[]} The absolute addresses. Records without a name are skipped, since they have
 *   no page, and a value that is not a list counts as no plugin.
 * @example
 * listSitemapUrls([{ name: 'abGate' }]);
 * // ['https://pedalboards.issoufi.fr/plugins', 'https://pedalboards.issoufi.fr/plugin/abgate']
 */
export const listSitemapUrls = plugins => {
  const seedPlugins = Array.isArray(plugins) ? plugins : [];
  const pluginUrls = seedPlugins
    .map(toSeedPluginId)
    .filter(Boolean)
    .map(id => `${SITE_ORIGIN}${PLUGIN_DETAILS_PATHNAME}/${encodeURIComponent(id)}`);

  return [`${SITE_ORIGIN}${PLUGINS_PATHNAME}`, ...pluginUrls];
};

/**
 * Writes the sitemap of the site. The addresses need no XML escaping: the origin is a constant, and
 * `encodeURIComponent` encodes `&` and `<` in the ids.
 *
 * @param {*} plugins - Records of data/plugins.json.
 * @returns {string} The text of `public/sitemap.xml`.
 */
export const buildSitemap = plugins => [
  '<?xml version="1.0" encoding="UTF-8"?>',
  `<urlset xmlns="${SITEMAP_NAMESPACE}">`,
  ...listSitemapUrls(plugins).map(url => `  <url><loc>${url}</loc></url>`),
  '</urlset>',
  ''
].join('\n');
