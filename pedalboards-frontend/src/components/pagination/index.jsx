// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

// Constants
import { FIRST_PAGE } from '../../utils/page/constants';
import { PAGE_GAP } from './constants';

// Utils
import { isPageNumber } from '../../utils/page';
import { getPageItems } from './utils';

// Style
import './style.scss';

/**
 * Props of {@link Pagination}.
 *
 * @typedef {Object} PaginationProps
 * @property {number} [currentPage=1] - Page shown, highlighted among the page numbers.
 * @property {number} [elementCount=0] - Number of pages. Nothing renders when it is not a positive
 *   integer.
 * @property {(page: number) => void} [onCurrentPageChange] - Called with the page number that the
 *   visitor picks.
 */

/**
 * Previous and next controls around the page numbers: the first and last pages, the pages next
 * to the current one, and a gap in place of the others. Renders nothing without pages. PREVIOUS on
 * the first page and NEXT on the last one are marked with `aria-disabled` and do nothing: the
 * `disabled` attribute would drop the focus of the visitor who reaches the end from the keyboard.
 *
 * @param {PaginationProps} props - Props of the component.
 */
const Pagination = ({
  elementCount = 0, currentPage = FIRST_PAGE, onCurrentPageChange
}) => {
  const shownPage = isPageNumber(currentPage) ? currentPage : FIRST_PAGE;
  const pageItems = getPageItems({ currentPage: shownPage, pageCount: elementCount });
  if (pageItems.length === 0) return null;

  const showPage = (page) => {
    if (typeof onCurrentPageChange === 'function') onCurrentPageChange(page);
  };
  const isFirstPage = shownPage === FIRST_PAGE;
  // A page past the last one shows until the page corrects its URL
  const isLastPage = shownPage >= elementCount;
  const goToPreviousPage = () => {
    if (!isFirstPage) showPage(shownPage - 1);
  };
  const goToNextPage = () => {
    if (!isLastPage) showPage(shownPage + 1);
  };

  return (
    <div className="navigation">
      <button
        type="button"
        className="previous-page"
        aria-disabled={isFirstPage}
        onClick={goToPreviousPage}
      >
        <FontAwesomeIcon icon={faAngleLeft} widthAuto />
        <span>PREVIOUS</span>
      </button>
      <div className="page-numbers">
        {pageItems.map((pageItem, index) => {
          if (pageItem === PAGE_GAP) {
            // Two gaps can show, so the position tells them apart.
            return <span key={`gap-${index}`} className="gap">{PAGE_GAP}</span>;
          }
          if (pageItem === shownPage) {
            return (
              <button key={pageItem} type="button" className="current-page" aria-current="page">
                {pageItem}
              </button>
            );
          }
          return (
            <button key={pageItem} type="button" onClick={() => showPage(pageItem)}>
              {pageItem}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="next-page"
        aria-disabled={isLastPage}
        onClick={goToNextPage}
      >
        <span>NEXT</span>
        <FontAwesomeIcon icon={faAngleRight} widthAuto />
      </button>
    </div>
  );
};

export default Pagination;
