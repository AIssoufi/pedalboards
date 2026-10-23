/** Page of plugins asked for when the caller gives none */
const DEFAULT_PAGE = 1;

/** Number of plugins in a page when the caller gives none */
const DEFAULT_PAGE_SIZE = 10;

/** Message of a load or a change asked for a plugin without an id, shown to the user */
const MISSING_PLUGIN_ID_MESSAGE = 'Le plugin n\'a pas d\'identifiant';

/**
 * Ids that `encodeURIComponent` leaves as they are and that the URL parser then removes as path
 * steps, so that the address of the plugin would name another resource
 */
const DOT_SEGMENTS = ['.', '..'];

export {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DOT_SEGMENTS,
  MISSING_PLUGIN_ID_MESSAGE
};
