// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

// Constants
import { FIRST_PAGE, IGNORE_PAGE_CHANGE } from './constants';

// Style
import './style.scss';


const getLeftPageNumbers = (currentPage) => {
  const results = [];
  if (currentPage <= 4) {
    for (let index = 1; index < currentPage; index++) {
      results.push(index);
    }
  } else {
    results.push(1, '...', currentPage - 1);
  }
  return results;
};

const getRightPageNumbers = (currentPage, elementCount) => {
  const result = [];

  if (currentPage === elementCount) { return result; }
  result.push(currentPage + 1);
  if (currentPage + 1 === elementCount) { return result; }
  if (currentPage + 1 === 2) {
    result.push(currentPage + 2);
    if (currentPage + 3 !== elementCount) {
      result.push('...');
    }
  } else if (currentPage + 1 !== elementCount && currentPage + 2 !== elementCount) {
    result.push('...');
  }
  result.push(elementCount);
  return result;
};

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

  const leftPageNumbers = getLeftPageNumbers(currentPage);
  const rigthPageNumbers = getRightPageNumbers(currentPage, elementCount);

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
        {rigthPageNumbers.map(pageNumber => (
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
  /** Page shown as current, from 1 */
  currentPage: PropTypes.number,
  /** Number of pages of the list */
  elementCount: PropTypes.number,
  /** Called with the number of the page that a click asks for */
  onCurrentPageChange: PropTypes.func
};

export default Pagination;
