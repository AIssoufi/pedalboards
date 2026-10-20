// Dependencies
import { act, renderHook } from '@testing-library/react';

// Constants
import { SCROLL_LISTENER_OPTIONS } from '../../constants';

// Hooks
import useBubblePosition from './index';

const VIEWPORT_SIZE = { width: 1280, height: 900 };
const TRIGGER_RECT = {
  top: 200, bottom: 220, left: 100, width: 50
};
// Position of a 150 by 30 pixels bubble above the trigger, 10 pixels away and centered on it
const POSITION_ABOVE = { top: 160, left: 50, placement: 'top' };

/**
 * Builds the refs of a trigger at `TRIGGER_RECT` and of a 150 by 30 pixels bubble.
 *
 * @returns {{triggerRef: object, bubbleRef: object}} The refs, the trigger box of which tests
 * can move.
 */
const buildRefs = () => {
  const trigger = { getBoundingClientRect: vi.fn(() => TRIGGER_RECT) };
  const bubble = { offsetWidth: 150, offsetHeight: 30 };
  return { triggerRef: { current: trigger }, bubbleRef: { current: bubble } };
};

/**
 * Renders the hook, open or not, with the refs given.
 *
 * @param {object} params
 * @param {boolean} params.isOpen - Whether the tooltip shows at first.
 * @param {object} params.refs - Refs of the trigger and of the bubble.
 * @returns {object} What `renderHook` returns, its `rerender` taking `{ isOpen }`.
 */
const renderPosition = ({ isOpen, refs }) => renderHook(
  props => useBubblePosition({ placement: 'top', ...refs, ...props }),
  { initialProps: { isOpen } }
);

describe('useBubblePosition', () => {
  beforeEach(() => {
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(VIEWPORT_SIZE.width);
    vi.spyOn(document.documentElement, 'clientHeight', 'get')
      .mockReturnValue(VIEWPORT_SIZE.height);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('measures nothing while the tooltip is closed', () => {
    const refs = buildRefs();
    const { result } = renderPosition({ isOpen: false, refs });

    expect(result.current).toBeNull();
    expect(refs.triggerRef.current.getBoundingClientRect).not.toHaveBeenCalled();
  });

  it('places the bubble when the tooltip opens', () => {
    const { result } = renderPosition({ isOpen: true, refs: buildRefs() });

    expect(result.current).toEqual(POSITION_ABOVE);
  });

  it.each(['scroll', 'resize'])('moves the bubble on %s while the tooltip is open', (type) => {
    const refs = buildRefs();
    const { result } = renderPosition({ isOpen: true, refs });
    refs.triggerRef.current.getBoundingClientRect.mockReturnValue({ ...TRIGGER_RECT, top: 300 });

    act(() => {
      window.dispatchEvent(new Event(type));
    });

    expect(result.current).toEqual({ ...POSITION_ABOVE, top: 260 });
  });

  it('keeps the last position once the tooltip closes, and stops following the page', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const refs = buildRefs();
    const { result, rerender } = renderPosition({ isOpen: true, refs });

    rerender({ isOpen: false });
    refs.triggerRef.current.getBoundingClientRect.mockReturnValue({ ...TRIGGER_RECT, top: 300 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toEqual(POSITION_ABOVE);
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), SCROLL_LISTENER_OPTIONS);
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it.each(['triggerRef', 'bubbleRef'])('gives no position while the %s is empty', (refName) => {
    const refs = { ...buildRefs(), [refName]: { current: null } };
    const { result } = renderPosition({ isOpen: true, refs });

    expect(result.current).toBeNull();
  });

  it('stops following the page on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderPosition({ isOpen: true, refs: buildRefs() });

    unmount();

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), SCROLL_LISTENER_OPTIONS);
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
