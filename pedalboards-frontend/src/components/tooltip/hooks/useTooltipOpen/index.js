// Dependencies
import { useEffect, useState } from 'react';

// Constants
import { CLOSE_KEY, VISIBLE_FOCUS_SELECTOR } from '../../constants';

/**
 * Keeps a tooltip open while the pointer is over its trigger or a visible focus is inside it: a
 * focus that the browser does not show, such as the one given back to a card after a mouse Back,
 * opens nothing. `CLOSE_KEY` closes it until the pointer comes back over the trigger or a visible
 * focus comes back inside it. While the tooltip is open, the hook listens for `keydown` on the
 * document, and removes that listener when the tooltip closes or the component unmounts.
 *
 * @returns {{isOpen: boolean, triggerProps: object}} Whether the tooltip shows, and the mouse and
 * focus handlers to give to the element around its trigger.
 */
const useTooltipOpen = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isOpen = isHovered || isFocused;

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnKey = (event) => {
      if (event.key !== CLOSE_KEY) return;
      setIsHovered(false);
      setIsFocused(false);
    };
    document.addEventListener('keydown', closeOnKey);
    return () => document.removeEventListener('keydown', closeOnKey);
  }, [isOpen]);

  const triggerProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onFocus: (event) => setIsFocused(event.target.matches(VISIBLE_FOCUS_SELECTOR)),
    onBlur: () => setIsFocused(false)
  };

  return { isOpen, triggerProps };
};

export default useTooltipOpen;
