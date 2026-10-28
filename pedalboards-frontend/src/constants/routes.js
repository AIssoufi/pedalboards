/** Path of the home page, which redirects to the list of the plugins. */
export const HOME_PATHNAME = '/';

/** Path of the page that lists the plugins. */
export const PLUGINS_PATHNAME = '/plugins';

/** Start of the path of the page of one plugin, which its id ends. */
export const PLUGIN_DETAILS_PATHNAME = '/plugin';

/** Route pattern of the page of one plugin, for the router: its `id` parameter names the plugin. */
export const PLUGIN_DETAILS_ROUTE = `${PLUGIN_DETAILS_PATHNAME}/:id`;

/** Route pattern matching any other path, which redirects to the list of the plugins. */
export const ANY_OTHER_ROUTE = '*';
