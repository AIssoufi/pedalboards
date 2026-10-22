// Constants
import {
  ELLIPSIS, FIRST_PAGE, NEXT_PAGES_AFTER_FIRST, NEXT_PAGES_AFTER_OTHERS
} from './constants';

/**
 * Lists the pages shown after the current one: the next pages, an ellipsis when it hides at least
 * one page, then the last page. Each page shows once, and a current page out of the list shows
 * none.
 * @param {Object} [params]
 * @param {number} [params.currentPage] page shown as current
 * @param {number} [params.pageCount] number of pages of the list
 * @returns {Array<number|string>} the page numbers, with the ellipsis between them when needed
 *
 * @example
 * getRightPageNumbers({ currentPage: 1, pageCount: 5 }); // [2, 3, '...', 5]
 * getRightPageNumbers({ currentPage: 1, pageCount: 3 }); // [2, 3]
 */
export const getRightPageNumbers = ({ currentPage, pageCount } = {}) => {
  const isCurrentPageInList = Number.isInteger(currentPage) && Number.isInteger(pageCount)
    && currentPage >= FIRST_PAGE && currentPage < pageCount;

  if (!isCurrentPageInList) return [];

  const nextPageCount = currentPage === FIRST_PAGE
    ? NEXT_PAGES_AFTER_FIRST
    : NEXT_PAGES_AFTER_OTHERS;
  const nextPages = Array.from({ length: nextPageCount }, (_, index) => currentPage + index + 1)
    .filter(page => page < pageCount);
  const lastShownPage = nextPages.length > 0 ? nextPages[nextPages.length - 1] : currentPage;
  const hasHiddenPages = pageCount - lastShownPage > 1;

  return hasHiddenPages
    ? [...nextPages, ELLIPSIS, pageCount]
    : [...nextPages, pageCount];
};
