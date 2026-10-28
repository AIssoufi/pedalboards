/** Page shown as current when none is given */
export const FIRST_PAGE = 1;

/** Mark that stands for the pages that the pagination hides */
export const ELLIPSIS = '...';

/** Last current page that still shows every page before it, without an ellipsis */
export const LAST_PAGE_WITHOUT_PREVIOUS_ELLIPSIS = 4;

/** Number of pages shown after the first page, before the ellipsis */
export const NEXT_PAGES_AFTER_FIRST = 2;

/** Number of pages shown after any other page, before the ellipsis */
export const NEXT_PAGES_AFTER_OTHERS = 1;

/** Visible text of the button that goes to the previous page */
export const PREVIOUS_PAGE_TEXT = 'Previous page';

/** Visible text of the button that goes to the next page */
export const NEXT_PAGE_TEXT = 'Next page';

/** Page change handler of a pagination given none: a click changes nothing */
export const IGNORE_PAGE_CHANGE = () => {};
