/** Key of the session storage entry that holds when the page last reloaded for a stale chunk. */
export const RELOAD_TIME_KEY = 'pedalboards:stale-chunk-reload-time';

/**
 * Delay, in milliseconds, within which a chunk that fails again after a reload is missing from
 * the new build too: reloading again would loop.
 */
export const RELOAD_GUARD_MS = 60 * 1000;
