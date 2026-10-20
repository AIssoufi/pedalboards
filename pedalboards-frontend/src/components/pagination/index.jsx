// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

// Constants
import { FIRST_PAGE } from 'utils/page/constants';
import { PAGE_GAP } from './constants';

// Utils
import { isPageNumber } from 'utils/page';
import { getPageItems } from './utils';

// Style
import './style.scss';

/**
 * Previous and next controls around the page numbers: the first and last pages, the pages next
 * to the current one, and a gap in place of the others. Renders nothing without pages.
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
  const goToPreviousPage = () => showPage(shownPage - 1);
  const goToNextPage = () => showPage(shownPage + 1);

  return (
    <div className="navigation">
      <div
        className="page-precedente"
        onClick={goToPreviousPage}
        onKeyPress={null}
        role="button"
        tabIndex={0}
      >
        <FontAwesomeIcon icon={faAngleLeft} />
        <p>PREVIOUS</p>
      </div>
      <div className="numero-de-page">
        {pageItems.map((pageItem, index) => {
          if (pageItem === PAGE_GAP) {
            // Two gaps can show, so the position tells them apart.
            // eslint-disable-next-line react/no-array-index-key
            return <span key={`gap-${index}`} className="gap">{PAGE_GAP}</span>;
          }
          if (pageItem === shownPage) {
            return (
              <button key={pageItem} type="button" className="current-page">{pageItem}</button>
            );
          }
          return (
            <button key={pageItem} type="button" onClick={() => showPage(pageItem)}>
              {pageItem}
            </button>
          );
        })}
      </div>
      <div
        className="page-suivante"
        onClick={goToNextPage}
        onKeyPress={null}
        role="button"
        tabIndex={-1}
      >
        <p>NEXT</p>
        <FontAwesomeIcon icon={faAngleRight} />
      </div>
    </div>
  );
};

Pagination.propTypes = {
  /** Page shown, highlighted among the page numbers. @default 1 */
  currentPage: PropTypes.number,
  /** Number of pages. Nothing renders when it is not a positive integer. @default 0 */
  elementCount: PropTypes.number,
  /** Called with the page number that the visitor picks. */
  onCurrentPageChange: PropTypes.func
};

export default Pagination;
