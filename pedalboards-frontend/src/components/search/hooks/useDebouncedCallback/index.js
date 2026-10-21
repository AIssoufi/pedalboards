// Dependencies
import { useEffect, useMemo, useRef } from 'react';

/**
 * Delays a callback until its calls pause: each call of `run` restarts the delay, and only the
 * last one calls the callback, with its arguments. The functions keep their identity across
 * renders while the delay stays the same, and always call the callback of the last render. The
 * pending call is dropped when the component unmounts.
 *
 * @param {Object} params
 * @param {Function} params.callback - Called once the calls pause. Anything but a function is
 * ignored.
 * @param {number} params.delayMs - Pause after the last call, in milliseconds.
 * @returns {{ run: Function, cancel: Function }} `run` (re)starts the delay, `cancel` drops the
 * pending call.
 * @example
 * const { run, cancel } = useDebouncedCallback({ callback: submit, delayMs: 900 });
 */
const useDebouncedCallback = ({ callback, delayMs }) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Drops the pending call when the component unmounts
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return useMemo(() => {
    const cancel = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    };
    const run = (...args) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = undefined;
        if (typeof callbackRef.current === 'function') callbackRef.current(...args);
      }, delayMs);
    };

    return { run, cancel };
  }, [delayMs]);
};

export default useDebouncedCallback;
