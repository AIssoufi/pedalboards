// Constants
import { SITE_NAME, TITLE_SEPARATOR } from './constants';

// Utils
import { isNonBlankText } from '../text';

/**
 * Builds the title of the tab for a page, so that each page of the site can be told apart.
 *
 * @param {*} pageName - Name of the page, such as the label of a plugin.
 * @returns {string} The name of the page and of the site, or the name of the site alone when the
 *   page has no name.
 * @example
 * buildPageTitle('Plugins'); // 'Plugins - Pedalboards'
 * buildPageTitle('   '); // 'Pedalboards'
 */
const buildPageTitle = pageName => (
  isNonBlankText(pageName) ? `${pageName.trim()}${TITLE_SEPARATOR}${SITE_NAME}` : SITE_NAME
);

export { buildPageTitle };
