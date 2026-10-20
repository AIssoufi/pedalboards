// Constants
import {
  DEFAULT_TOOLTIP_PLACEMENT,
  TOOLTIP_DISTANCE_PX,
  TOOLTIP_PLACEMENT,
  TOOLTIP_PLACEMENTS,
  VIEWPORT_MARGIN_PX
} from './constants';

/**
 * Gives the side of its trigger where a tooltip shows.
 *
 * @param {*} placement - Side given to the tooltip.
 * @returns {string} The side given when it is one of `TOOLTIP_PLACEMENTS`, otherwise
 * `DEFAULT_TOOLTIP_PLACEMENT`.
 */
const getTooltipPlacement = placement => (
  TOOLTIP_PLACEMENTS.includes(placement) ? placement : DEFAULT_TOOLTIP_PLACEMENT
);

/**
 * Tells whether React renders nothing for a node.
 *
 * @param {*} node - Content or children given to a component.
 * @returns {boolean} True for `undefined`, `null`, a boolean, an empty string or an empty list.
 */
const isEmptyNode = (node) => {
  const isEmptyList = Array.isArray(node) && node.length === 0;
  return node === undefined || node === null || typeof node === 'boolean' || node === ''
    || isEmptyList;
};

/**
 * Picks the side of the trigger where the bubble shows: the side asked for, unless the bubble
 * would overflow the viewport there and fits on the other side.
 *
 * @param {object} params
 * @param {string} params.placement - Side asked for, one of `TOOLTIP_PLACEMENTS`.
 * @param {{top: number, bottom: number}} params.triggerRect - Box of the trigger, in viewport
 * coordinates.
 * @param {number} params.bubbleHeight - Height of the bubble, in pixels.
 * @param {number} params.viewportHeight - Height of the viewport, in pixels.
 * @returns {string} The side where the bubble shows.
 */
const getFittingPlacement = ({
  placement, triggerRect, bubbleHeight, viewportHeight
}) => {
  const neededHeight = bubbleHeight + TOOLTIP_DISTANCE_PX;
  const hasRoom = {
    [TOOLTIP_PLACEMENT.top]: triggerRect.top - neededHeight >= 0,
    [TOOLTIP_PLACEMENT.bottom]: triggerRect.bottom + neededHeight <= viewportHeight
  };
  const otherPlacement = placement === TOOLTIP_PLACEMENT.top
    ? TOOLTIP_PLACEMENT.bottom
    : TOOLTIP_PLACEMENT.top;
  const shouldFlip = !hasRoom[placement] && hasRoom[otherPlacement];

  return shouldFlip ? otherPlacement : placement;
};

/**
 * Places the bubble centered on its trigger, then shifts it sideways to keep it in the viewport.
 *
 * @param {object} params
 * @param {{left: number, width: number}} params.triggerRect - Box of the trigger, in viewport
 * coordinates.
 * @param {number} params.bubbleWidth - Width of the bubble, in pixels.
 * @param {number} params.viewportWidth - Width of the viewport, in pixels.
 * @returns {number} Left side of the bubble, in viewport coordinates. A bubble wider than the
 * viewport starts at its left margin, where the start of its text stays readable.
 */
const getBubbleLeft = ({ triggerRect, bubbleWidth, viewportWidth }) => {
  const centeredLeft = triggerRect.left + (triggerRect.width - bubbleWidth) / 2;
  const maxLeft = viewportWidth - VIEWPORT_MARGIN_PX - bubbleWidth;

  return Math.max(VIEWPORT_MARGIN_PX, Math.min(centeredLeft, maxLeft));
};

/**
 * Places the bubble of a tooltip `TOOLTIP_DISTANCE_PX` away from its trigger, centered on it, on
 * the side asked for unless only the other side has room, and shifted sideways to stay at least
 * `VIEWPORT_MARGIN_PX` from the sides of the viewport.
 *
 * @param {object} params
 * @param {{top: number, bottom: number, left: number, width: number}} params.triggerRect - Box of
 * the trigger, in viewport coordinates, as `getBoundingClientRect` gives it.
 * @param {{width: number, height: number}} params.bubbleSize - Size of the bubble, in pixels.
 * @param {*} params.placement - Side asked for, `DEFAULT_TOOLTIP_PLACEMENT` when it is not one of
 * `TOOLTIP_PLACEMENTS`.
 * @param {{width: number, height: number}} params.viewportSize - Size of the viewport without its
 * scrollbars, in pixels.
 * @returns {{top: number, left: number, placement: string}} Top left corner of the bubble, in
 * viewport coordinates, and the side where it shows.
 * @example
 * getBubblePosition({
 *   triggerRect: { top: 200, bottom: 220, left: 100, width: 50 },
 *   bubbleSize: { width: 150, height: 30 },
 *   placement: 'top',
 *   viewportSize: { width: 1280, height: 900 }
 * }); // { top: 160, left: 50, placement: 'top' }
 */
const getBubblePosition = ({
  triggerRect, bubbleSize, placement, viewportSize
}) => {
  const fittingPlacement = getFittingPlacement({
    placement: getTooltipPlacement(placement),
    triggerRect,
    bubbleHeight: bubbleSize.height,
    viewportHeight: viewportSize.height
  });
  const top = fittingPlacement === TOOLTIP_PLACEMENT.top
    ? triggerRect.top - TOOLTIP_DISTANCE_PX - bubbleSize.height
    : triggerRect.bottom + TOOLTIP_DISTANCE_PX;
  const left = getBubbleLeft({
    triggerRect, bubbleWidth: bubbleSize.width, viewportWidth: viewportSize.width
  });

  return { top, left, placement: fittingPlacement };
};

export { getBubblePosition, getTooltipPlacement, isEmptyNode };
