// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

// Constants
import { FIRST_PAGE, IGNORE_PAGE_CHANGE } from './constants';

// Utils
import { getLeftPageNumbers, getRightPageNumbers } from './utils';

// Style
import './style.scss';

/**
 * Links to the previous page, the next page and the pages around the current one. Renders nothing
 * while the list has no page.
 */
const Pagination = ({
  elementCount = 0, currentPage = FIRST_PAGE, onCurrentPageChange = IGNORE_PAGE_CHANGE
}) => {
  if (!elementCount || elementCount <= 0) return null;

  const goToPreviousPage = () => onCurrentPageChange(currentPage - 1);
  const goToNextPage = () => onCurrentPageChange(currentPage + 1);

  const leftPageNumbers = getLeftPageNumbers({ currentPage });
  const rightPageNumbers = getRightPageNumbers({ currentPage, pageCount: elementCount });

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
        <p>Page pérécedente</p>
      </div>
      <div className="numero-de-page">
        {leftPageNumbers.map(pageNumber => (
          <button
            type="button"
            key={pageNumber}
            onClick={() => onCurrentPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button type="button" className="current-page">{currentPage}</button>
        {rightPageNumbers.map(pageNumber => (
          <button
            type="button"
            key={pageNumber}
            onClick={() => onCurrentPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>
      <div
        className="page-suivante"
        onClick={goToNextPage}
        onKeyPress={null}
        role="button"
        tabIndex={-1}
      >
        <p>Page suivante</p>
        <FontAwesomeIcon icon={faAngleRight} />
      </div>
    </div>
  );
};

Pagination.propTypes = {
  /**
   * Page shown as current, from 1.
   * @default 1
   */
  currentPage: PropTypes.number,
  /**
   * Number of pages of the list: the pagination renders nothing without one.
   * @default 0
   */
  elementCount: PropTypes.number,
  /**
   * Called with the number of the page that a click asks for.
   * @default a handler that changes nothing
   */
  onCurrentPageChange: PropTypes.func
};

export default Pagination;
