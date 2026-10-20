// Dependencies
import { useLayoutEffect, useState } from 'react';

// Constants
import { SCROLL_LISTENER_OPTIONS } from '../../constants';

// Utils
import { getBubblePosition } from '../../utils';

/**
 * Measures where the bubble of a tooltip goes when it opens, before the browser paints it, then
 * again on each scroll and resize while it stays open.
 *
 * @param {object} params
 * @param {boolean} params.isOpen - Whether the tooltip shows.
 * @param {*} params.placement - Side of the trigger asked for, as `getBubblePosition` reads it.
 * @param {{current: ?Element}} params.triggerRef - Element around the trigger.
 * @param {{current: ?HTMLElement}} params.bubbleRef - Bubble of the tooltip.
 * @returns {?{top: number, left: number, placement: string}} The position that
 * `getBubblePosition` gives, kept after the tooltip closes so the bubble fades out in place, and
 * `null` until both elements are there when the tooltip opens.
 */
const useBubblePosition = ({
  isOpen, placement, triggerRef, bubbleRef
}) => {
  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const bubble = bubbleRef.current;
      if (!trigger || !bubble) return;

      const { clientWidth, clientHeight } = document.documentElement;
      setPosition(getBubblePosition({
        triggerRect: trigger.getBoundingClientRect(),
        bubbleSize: { width: bubble.offsetWidth, height: bubble.offsetHeight },
        placement,
        viewportSize: { width: clientWidth, height: clientHeight }
      }));
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, SCROLL_LISTENER_OPTIONS);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, SCROLL_LISTENER_OPTIONS);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, placement, triggerRef, bubbleRef]);

  return position;
};

export default useBubblePosition;
