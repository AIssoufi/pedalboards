// Dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

// CSS
import './style.scss';

export default class Pagination extends Component {
  static propTypes = {
    currentPage: PropTypes.number.isRequired,
    elementCount: PropTypes.number.isRequired,
    onCurrentPageChange: PropTypes.func.isRequired
  }

  getLeftPageNumbers(currentPage) {
    const result = [];
    if (currentPage <= 4) {
      for (let i = 1; i < currentPage; i++) {
        result.push(i);
      }
    } else {
      result.push(1);
      result.push('...');
      result.push(currentPage - 1);
    }
    return result;
  }

  getRightPageNumbers(currentPage, elementCount) {
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
  }

  render() {
    if (!this.props.elementCount || this.props.elementCount <= 0) return null;
    return (
      <div className="navigation">
        <div
          className="page-precedente"
          onClick={() => this.props.onCurrentPageChange(this.props.currentPage - 1)}>
          <FontAwesomeIcon icon={faAngleLeft} />
          <p>Page pérécedente</p>
        </div>
        <div className="numero-de-page">
          {this.getLeftPageNumbers(this.props.currentPage)
            .map(pageNumber => <button
              type="button"
              key={pageNumber}
              onClick={() => this.props.onCurrentPageChange(pageNumber)}>{pageNumber}</button>)}
          <button type="button" className="current-page">{this.props.currentPage}</button>
          {this.getRightPageNumbers(
            this.props.currentPage,
            this.props.elementCount
          ).map(pageNumber => <button
            type="button"
            key={pageNumber}
            onClick={() => this.props.onCurrentPageChange(pageNumber)}>{pageNumber}</button>)}
        </div>
        <div
          className="page-suivante"
          onClick={() => this.props.onCurrentPageChange(this.props.currentPage + 1)}>
          <p>Page suivante</p>
          <FontAwesomeIcon icon={faAngleRight} />
        </div>
      </div>);
  }
}
