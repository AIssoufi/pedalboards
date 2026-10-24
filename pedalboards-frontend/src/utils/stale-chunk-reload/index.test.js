// Constants
import { RELOAD_GUARD_MS, RELOAD_TIME_KEY } from './constants';

import { reloadOnceForStaleChunk } from './index';

const NOW = 1_800_000_000_000;

// Time between the reload and a second failure, within the guard delay
const SECOND_FAILURE_DELAY_MS = RELOAD_GUARD_MS / 2;

/**
 * Builds an in-memory storage with the Storage methods the helper calls.
 *
 * @param {Record<string, string>} [entries] - Entries the storage starts with.
 * @returns {{ getItem: Function, setItem: Function }} The storage.
 */
const createStorage = (entries = {}) => {
  const values = new Map(Object.entries(entries));
  return {
    getItem: vi.fn((key) => (values.has(key) ? values.get(key) : null)),
    setItem: vi.fn((key, value) => values.set(key, value))
  };
};

describe('reloadOnceForStaleChunk', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reloads the page and stores the time of the reload', () => {
    const storage = createStorage();
    const reload = vi.fn();

    const reloaded = reloadOnceForStaleChunk({ getStorage: () => storage, reload, now: NOW });

    expect(reloaded).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(RELOAD_TIME_KEY, String(NOW));
  });

  it('does not reload again on a second failure in the same session', () => {
    const storage = createStorage();
    const reload = vi.fn();

    reloadOnceForStaleChunk({ getStorage: () => storage, reload, now: NOW });
    const reloadedAgain = reloadOnceForStaleChunk({
      getStorage: () => storage,
      reload,
      now: NOW + SECOND_FAILURE_DELAY_MS
    });

    expect(reloadedAgain).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload just before the end of the guard delay', () => {
    const storage = createStorage({ [RELOAD_TIME_KEY]: String(NOW) });
    const reload = vi.fn();

    const reloaded = reloadOnceForStaleChunk({
      getStorage: () => storage,
      reload,
      now: NOW + RELOAD_GUARD_MS - 1
    });

    expect(reloaded).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('reloads again once the guard delay is over, after a later deploy', () => {
    const storage = createStorage({ [RELOAD_TIME_KEY]: String(NOW) });
    const reload = vi.fn();
    const later = NOW + RELOAD_GUARD_MS;

    const reloaded = reloadOnceForStaleChunk({ getStorage: () => storage, reload, now: later });

    expect(reloaded).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(RELOAD_TIME_KEY, String(later));
  });

  it.each(['not a time', '', String(NOW + RELOAD_GUARD_MS)])(
    'reloads when the stored time is %p, invalid or in the future',
    (storedTime) => {
      const storage = createStorage({ [RELOAD_TIME_KEY]: storedTime });
      const reload = vi.fn();

      expect(reloadOnceForStaleChunk({ getStorage: () => storage, reload, now: NOW })).toBe(true);
      expect(reload).toHaveBeenCalledTimes(1);
    }
  );

  it('reloads without a stored time, even when the time given is close to the epoch', () => {
    const storage = createStorage();
    const reload = vi.fn();
    const nearEpoch = RELOAD_GUARD_MS - 1;

    expect(reloadOnceForStaleChunk({ getStorage: () => storage, reload, now: nearEpoch })).toBe(
      true
    );
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload when reading the storage throws', () => {
    const reload = vi.fn();
    const getStorage = () => {
      throw new DOMException('The storage is blocked', 'SecurityError');
    };

    expect(reloadOnceForStaleChunk({ getStorage, reload, now: NOW })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('does not reload when the storage refuses to write', () => {
    const storage = createStorage();
    storage.setItem.mockImplementation(() => {
      throw new DOMException('The quota is exceeded', 'QuotaExceededError');
    });
    const reload = vi.fn();

    expect(reloadOnceForStaleChunk({ getStorage: () => storage, reload, now: NOW })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it.each([undefined, null, {}, () => null])(
    'does not reload when the storage getter is %p',
    (getStorage) => {
      const reload = vi.fn();

      expect(reloadOnceForStaleChunk({ getStorage, reload, now: NOW })).toBe(false);
      expect(reload).not.toHaveBeenCalled();
    }
  );

  it.each([undefined, null, 'reload'])('does nothing when the reload is %p', (reload) => {
    const storage = createStorage();

    expect(reloadOnceForStaleChunk({ getStorage: () => storage, reload, now: NOW })).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('does nothing without parameters', () => {
    expect(reloadOnceForStaleChunk()).toBe(false);
  });

  it.each([undefined, null, NaN, Infinity, '1800000000000'])(
    'uses the current time when the time given is %p',
    (now) => {
      vi.spyOn(Date, 'now').mockReturnValue(NOW);
      const storage = createStorage();

      reloadOnceForStaleChunk({ getStorage: () => storage, reload: vi.fn(), now });

      expect(storage.setItem).toHaveBeenCalledWith(RELOAD_TIME_KEY, String(NOW));
    }
  );
});
