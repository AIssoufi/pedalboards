// Dependencies
import { renderHook } from '@testing-library/react';

// Hooks
import useDebouncedCallback from './index';

const DELAY_MS = 900;

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderDebounced = ({ callback, delayMs = DELAY_MS }) => renderHook(
    props => useDebouncedCallback(props),
    { initialProps: { callback, delayMs } }
  );

  it('calls the callback once the delay is over, with the arguments of the call', () => {
    const callback = vi.fn();
    const { result } = renderDebounced({ callback });

    result.current.run('a', 1);
    vi.advanceTimersByTime(DELAY_MS - 1);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a', 1);
  });

  it('calls the callback once for several calls, with the arguments of the last one', () => {
    const callback = vi.fn();
    const { result } = renderDebounced({ callback });

    result.current.run('M');
    vi.advanceTimersByTime(DELAY_MS / 2);
    result.current.run('MD');
    vi.advanceTimersByTime(DELAY_MS / 2);
    result.current.run('MDA');
    vi.advanceTimersByTime(DELAY_MS);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('MDA');
  });

  it('keeps the same functions across renders', () => {
    const { result, rerender } = renderDebounced({ callback: vi.fn() });
    const first = result.current;

    rerender({ callback: vi.fn(), delayMs: DELAY_MS });

    expect(result.current).toBe(first);
  });

  it('calls the callback of the last render', () => {
    const first = vi.fn();
    const last = vi.fn();
    const { result, rerender } = renderDebounced({ callback: first });

    result.current.run();
    rerender({ callback: last, delayMs: DELAY_MS });
    vi.advanceTimersByTime(DELAY_MS);

    expect(first).not.toHaveBeenCalled();
    expect(last).toHaveBeenCalledTimes(1);
  });

  it('drops the pending call on cancel', () => {
    const callback = vi.fn();
    const { result } = renderDebounced({ callback });

    result.current.run();
    result.current.cancel();
    vi.advanceTimersByTime(DELAY_MS);

    expect(callback).not.toHaveBeenCalled();
  });

  it('cancels without a pending call', () => {
    const { result } = renderDebounced({ callback: vi.fn() });

    expect(() => result.current.cancel()).not.toThrow();
  });

  it('drops the pending call when the component unmounts', () => {
    const callback = vi.fn();
    const { result, unmount } = renderDebounced({ callback });

    result.current.run();
    unmount();
    vi.advanceTimersByTime(DELAY_MS);

    expect(callback).not.toHaveBeenCalled();
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['a text', 'submit']
  ])('ignores a callback that is %s', (description, callback) => {
    const { result } = renderDebounced({ callback });

    result.current.run();

    expect(() => vi.advanceTimersByTime(DELAY_MS)).not.toThrow();
  });
});
