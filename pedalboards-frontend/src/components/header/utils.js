// Constants
import { ADMIN_PANEL_PATH } from './constants';

/**
 * Gives the link of the admin panel, which the CMS serves.
 *
 * @param {string} [cmsUrl] - Address of the CMS (`VITE_BACKEND`), empty where the CMS is not
 *   deployed.
 * @returns {string|null} The link, or null without a CMS address, so that the header hides it.
 * @example
 * getAdminPanelUrl('http://localhost:3002'); // 'http://localhost:3002/login'
 * getAdminPanelUrl(''); // null
 */
const getAdminPanelUrl = cmsUrl => (cmsUrl ? `${cmsUrl}${ADMIN_PANEL_PATH}` : null);

export {
  getAdminPanelUrl
};
