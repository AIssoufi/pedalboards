// Dependencies
import {
  cloneElement, isValidElement, useId, useRef
} from 'react';
import { createPortal } from 'react-dom';

// Constants
import { DEFAULT_TOOLTIP_PLACEMENT } from './constants';

// Hooks
import useBubblePosition from './hooks/useBubblePosition';
import useTooltipOpen from './hooks/useTooltipOpen';

// Utils
import { getTooltipPlacement, isEmptyNode } from './utils';

// Style
import './style.scss';

/**
 * Props of {@link Tooltip}.
 *
 * @typedef {Object} TooltipProps
 * @property {import('react').ReactNode} [content=null] - Content of the bubble. Without it, the
 *   children show alone.
 * @property {'top'|'bottom'} [placement='top'] - Side of the children where the bubble shows,
 *   unless only the other side has room in the viewport. An unknown side shows the bubble on top.
 * @property {import('react').ReactNode} [children=null] - Element that the bubble describes, such
 *   as a link or a button.
 */

/**
 * Shows `content` in a dark bubble next to its children while the pointer is over them or the
 * focus is inside them, until Escape. The bubble sits at the end of the page, so no parent clips
 * it, and stays within the viewport. A single child element gets the bubble as its description
 * (`aria-describedby`), which screen readers announce on focus. Renders the children alone without
 * content, and nothing without children.
 *
 * @param {TooltipProps} props - Props of the component.
 *
 * @example
 * <Tooltip content={<i>Click to launch the search</i>} placement="top">
 *   <button type="submit">Search</button>
 * </Tooltip>
 */
const Tooltip = ({ content = null, placement = DEFAULT_TOOLTIP_PLACEMENT, children = null }) => {
  const bubbleId = useId();
  const triggerRef = useRef(null);
  const bubbleRef = useRef(null);
  const { isOpen, triggerProps } = useTooltipOpen();
  const position = useBubblePosition({
    isOpen, placement, triggerRef, bubbleRef
  });

  if (isEmptyNode(children)) return null;
  if (isEmptyNode(content)) return <>{children}</>;

  const trigger = isValidElement(children)
    ? cloneElement(children, {
      'aria-describedby': [children.props['aria-describedby'], bubbleId].filter(Boolean).join(' ')
    })
    : children;
  const bubbleClassName = [
    'tooltip',
    position?.placement ?? getTooltipPlacement(placement),
    isOpen && 'open'
  ].filter(Boolean).join(' ');
  const bubbleStyle = position ? { top: position.top, left: position.left } : undefined;

  return (
    <>
      <span className="tooltip-trigger" ref={triggerRef} {...triggerProps}>
        {trigger}
      </span>
      {createPortal(
        <div
          id={bubbleId}
          role="tooltip"
          className={bubbleClassName}
          style={bubbleStyle}
          ref={bubbleRef}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
