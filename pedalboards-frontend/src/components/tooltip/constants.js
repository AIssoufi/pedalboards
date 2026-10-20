/** Each side of its trigger where a tooltip can show, also the class of its bubble. */
export const TOOLTIP_PLACEMENT = { top: 'top', bottom: 'bottom' };

/** Sides of its trigger where a tooltip can show. */
export const TOOLTIP_PLACEMENTS = Object.values(TOOLTIP_PLACEMENT);

/** Side where a tooltip shows when none is given, or an unknown one. */
export const DEFAULT_TOOLTIP_PLACEMENT = TOOLTIP_PLACEMENT.top;

/** Gap between a tooltip and its trigger, in pixels. */
export const TOOLTIP_DISTANCE_PX = 10;

/** Smallest gap between a tooltip and the sides of the viewport, in pixels. */
export const VIEWPORT_MARGIN_PX = 10;

/** Key that closes an open tooltip. */
export const CLOSE_KEY = 'Escape';

/**
 * Options of the scroll listener that moves an open tooltip: in the capture phase, to hear the
 * scroll of any container, and passive, since it never cancels the scroll.
 */
export const SCROLL_LISTENER_OPTIONS = { capture: true, passive: true };
