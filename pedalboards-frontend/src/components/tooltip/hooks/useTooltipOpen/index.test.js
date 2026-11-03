// Dependencies
import { act, renderHook } from '@testing-library/react';

// Constants
import { CLOSE_KEY, VISIBLE_FOCUS_SELECTOR } from '../../constants';

// Hooks
import useTooltipOpen from './index';

/**
 * Builds the event of a focus. In jsdom, a real focus matches `:focus-visible` or not after the
 * events of earlier tests, so this target only answers `matches`.
 *
 * @param {boolean} isVisible - Whether the target matches the selector of a visible focus.
 * @returns {{target: {matches: (selector: string) => boolean}}} The event.
 */
const buildFocusEvent = (isVisible) => ({
  target: { matches: (selector) => isVisible && selector === VISIBLE_FOCUS_SELECTOR }
});

const VISIBLE_FOCUS_EVENT = buildFocusEvent(true);
const HIDDEN_FOCUS_EVENT = buildFocusEvent(false);

/**
 * Presses a key on the page.
 *
 * @param {string} key - Value of `KeyboardEvent.key`.
 */
const pressKey = (key) => {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key }));
  });
};

describe('useTooltipOpen', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts closed', () => {
    const { result } = renderHook(() => useTooltipOpen());

    expect(result.current.isOpen).toBe(false);
  });

  it('opens while the pointer is over the trigger', () => {
    const { result } = renderHook(() => useTooltipOpen());

    act(() => result.current.triggerProps.onMouseEnter());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.triggerProps.onMouseLeave());
    expect(result.current.isOpen).toBe(false);
  });

  it('opens while a visible focus is inside the trigger', () => {
    const { result } = renderHook(() => useTooltipOpen());

    act(() => result.current.triggerProps.onFocus(VISIBLE_FOCUS_EVENT));
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.triggerProps.onBlur());
    expect(result.current.isOpen).toBe(false);
  });

  it('stays closed on a focus that the browser does not show', () => {
    const { result } = renderHook(() => useTooltipOpen());

    act(() => result.current.triggerProps.onFocus(HIDDEN_FOCUS_EVENT));

    expect(result.current.isOpen).toBe(false);
  });

  it('closes when the pointer leaves after a focus that the browser does not show', () => {
    const { result } = renderHook(() => useTooltipOpen());

    act(() => {
      result.current.triggerProps.onMouseEnter();
      result.current.triggerProps.onFocus(HIDDEN_FOCUS_EVENT);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.triggerProps.onMouseLeave());
    expect(result.current.isOpen).toBe(false);
  });

  it('closes when a hidden focus replaces a visible one inside the trigger', () => {
    const { result } = renderHook(() => useTooltipOpen());
    act(() => result.current.triggerProps.onFocus(VISIBLE_FOCUS_EVENT));

    act(() => result.current.triggerProps.onFocus(HIDDEN_FOCUS_EVENT));

    expect(result.current.isOpen).toBe(false);
  });

  it('stays open while a visible focus is inside after the pointer leaves', () => {
    const { result } = renderHook(() => useTooltipOpen());

    act(() => {
      result.current.triggerProps.onFocus(VISIBLE_FOCUS_EVENT);
      result.current.triggerProps.onMouseEnter();
    });
    act(() => result.current.triggerProps.onMouseLeave());

    expect(result.current.isOpen).toBe(true);
  });

  it('closes on the close key until the pointer comes back', () => {
    const { result } = renderHook(() => useTooltipOpen());
    act(() => {
      result.current.triggerProps.onFocus(VISIBLE_FOCUS_EVENT);
      result.current.triggerProps.onMouseEnter();
    });

    pressKey(CLOSE_KEY);
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.triggerProps.onMouseLeave();
      result.current.triggerProps.onMouseEnter();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it.each(['Enter', 'Tab', 'Esc', ''])('stays open on the key %j', (key) => {
    const { result } = renderHook(() => useTooltipOpen());
    act(() => result.current.triggerProps.onMouseEnter());

    pressKey(key);

    expect(result.current.isOpen).toBe(true);
  });

  it('listens to the keyboard only while open', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const { result } = renderHook(() => useTooltipOpen());
    expect(add).not.toHaveBeenCalledWith('keydown', expect.any(Function));

    act(() => result.current.triggerProps.onMouseEnter());
    expect(add).toHaveBeenCalledWith('keydown', expect.any(Function));

    const [, keydownListener] = add.mock.calls.find(([type]) => type === 'keydown');
    act(() => result.current.triggerProps.onMouseLeave());
    expect(remove).toHaveBeenCalledWith('keydown', keydownListener);
  });

  it('stops listening to the keyboard on unmount', () => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const { result, unmount } = renderHook(() => useTooltipOpen());
    act(() => result.current.triggerProps.onFocus(VISIBLE_FOCUS_EVENT));

    unmount();

    expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
