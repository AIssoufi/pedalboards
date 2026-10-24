// Constants
import { RELOAD_GUARD_MS, RELOAD_TIME_KEY } from './constants';

/**
 * Tells whether the page reloaded for a stale chunk shortly before, from the time it stored.
 *
 * @param {object} params
 * @param {string | null} params.storedTime - Value of the storage entry, null when it is unset.
 * @param {number} params.now - Current time, in milliseconds since the epoch.
 * @returns {boolean} True when the stored time is less than the guard delay before now, false
 *   when no time is stored.
 */
const hasReloadedRecently = ({ storedTime, now }) => {
  // Number() would read an unset or empty entry as the epoch
  if (!storedTime) return false;

  const elapsed = now - Number(storedTime);
  return elapsed >= 0 && elapsed < RELOAD_GUARD_MS;
};

/**
 * Reloads the page when a chunk of the build fails to load, which happens in a tab opened before
 * a deploy: the new build no longer has the chunks of the old one. The time of the reload is kept
 * in the session storage, so a chunk that fails again within a minute, missing from the new build
 * too, does not reload the page in a loop.
 *
 * @param {object} [params]
 * @param {() => Storage} [params.getStorage] - Gives the session storage; reading it may throw
 *   when the browser blocks the storage.
 * @param {() => void} [params.reload] - Reloads the page.
 * @param {number} [params.now] - Current time, in milliseconds since the epoch; `Date.now()`
 *   when it is not a finite number.
 * @returns {boolean} True when it reloaded the page, false when it reloaded shortly before, or
 *   when the storage or the reload is unavailable.
 * @example
 * window.addEventListener('vite:preloadError', () => {
 *   reloadOnceForStaleChunk({
 *     getStorage: () => window.sessionStorage,
 *     reload: () => window.location.reload()
 *   });
 * });
 */
const reloadOnceForStaleChunk = ({ getStorage, reload, now } = {}) => {
  if (typeof reload !== 'function') return false;

  const currentTime = Number.isFinite(now) ? now : Date.now();

  try {
    const storage = getStorage();
    const storedTime = storage.getItem(RELOAD_TIME_KEY);
    if (hasReloadedRecently({ storedTime, now: currentTime })) return false;

    storage.setItem(RELOAD_TIME_KEY, String(currentTime));
  } catch {
    // Without a storage to remember the reload, a second failure would reload again in a loop
    return false;
  }

  reload();
  return true;
};

export { reloadOnceForStaleChunk };
