// Constants
import { FIRST_PAGE } from '../../utils/page/constants';
import { MIN_PAGES_IN_GAP, PAGE_GAP } from './constants';

// Utils
import { isPageNumber } from '../../utils/page';

/**
 * Lists the pages from `first` to `last`, with a gap in place of the pages between them when it
 * hides at least `MIN_PAGES_IN_GAP` pages.
 *
 * @param {object} params
 * @param {number} params.first - First page of the range.
 * @param {number} params.last - Last page of the range.
 * @returns {Array<number|string>} The pages and the gap, empty when `first` is after `last`.
 * @example
 * getPageRange({ first: 1, last: 3 }); // [1, 2, 3]
 * getPageRange({ first: 1, last: 4 }); // [1, '...', 4]
 */
const getPageRange = ({ first, last }) => {
  if (first > last) return [];

  const hiddenPageCount = last - first - 1;
  if (hiddenPageCount >= MIN_PAGES_IN_GAP) return [first, PAGE_GAP, last];

  const pages = [];
  for (let page = first; page <= last; page += 1) {
    pages.push(page);
  }
  return pages;
};

/**
 * Lists the items of the pagination: the first page, the page before the current one, the
 * current page, the page after it and the last page, each page once, with `PAGE_GAP` only where
 * pages are hidden.
 *
 * @param {object} params
 * @param {number} params.currentPage - Page shown, the first page when it is not a page number.
 * @param {number} params.pageCount - Number of pages.
 * @returns {Array<number|string>} The page numbers and gaps, in order, or an empty list when
 * `pageCount` is not a page number.
 * @example
 * getPageItems({ currentPage: 6, pageCount: 54 }); // [1, '...', 5, 6, 7, '...', 54]
 * getPageItems({ currentPage: 1, pageCount: 3 }); // [1, 2, 3]
 */
const getPageItems = ({ currentPage, pageCount }) => {
  if (!isPageNumber(pageCount)) return [];

  const page = isPageNumber(currentPage) ? currentPage : FIRST_PAGE;
  const lastPageBefore = Math.min(page - 1, pageCount);

  return [
    ...getPageRange({ first: FIRST_PAGE, last: lastPageBefore }),
    page,
    ...getPageRange({ first: page + 1, last: pageCount })
  ];
};

export { getPageItems };
