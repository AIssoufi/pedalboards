// Constants
import { PLUGINS_PATHNAME, SITE_ORIGIN } from '../../constants/routes';
import { QUERY_AND_FRAGMENT, SITE_PATH_START } from './constants';

// Utils
import { isNonBlankText } from '../text';

/**
 * Builds the canonical address of a page, the one that search engines keep for it: always on the
 * deployed site, even from a preview deployment, and with no query string.
 *
 * @param {*} pathname - Path of the page, such as the result of `buildPluginPathname`.
 * @returns {string} The absolute address, or the one of the list of the plugins when the path
 *   names no page.
 * @example
 * buildCanonicalUrl('/plugin/abgate'); // 'https://pedalboards.issoufi.fr/plugin/abgate'
 * buildCanonicalUrl('/plugins?brand=MDA'); // 'https://pedalboards.issoufi.fr/plugins'
 * buildCanonicalUrl(''); // 'https://pedalboards.issoufi.fr/plugins'
 * buildCanonicalUrl('https://example.com/x'); // 'https://pedalboards.issoufi.fr/plugins'
 */
const buildCanonicalUrl = (pathname) => {
  const path = isNonBlankText(pathname) ? pathname.replace(QUERY_AND_FRAGMENT, '').trim() : '';
  const isSitePath = path.startsWith(SITE_PATH_START);

  return `${SITE_ORIGIN}${isSitePath ? path : PLUGINS_PATHNAME}`;
};

export { buildCanonicalUrl };
