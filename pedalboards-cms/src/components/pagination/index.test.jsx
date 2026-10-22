// Dependencies
import React from 'react';
import { act } from 'react-dom/test-utils';

// Utils
import { render } from 'utils/testing';

// Components
import Pagination from './index';

const readPageLabels = container => Array.from(
  container.querySelectorAll('.numero-de-page button'),
  button => button.textContent
);

const clickNextPage = (container) => {
  act(() => {
    container.querySelector('.page-suivante').click();
  });
};

describe('Pagination', () => {
  let view;

  beforeEach(() => {
    jest.spyOn(console, 'error');
  });

  afterEach(() => {
    if (view) view.unmount();
    view = undefined;
    jest.restoreAllMocks();
  });

  it('shows the pages around the current one', () => {
    view = render(<Pagination currentPage={6} elementCount={54} onCurrentPageChange={() => {}} />);

    expect(readPageLabels(view.container)).toEqual(['1', '...', '5', '6', '7', '...', '54']);
  });

  it('shows each page once on the first page of three', () => {
    view = render(<Pagination currentPage={1} elementCount={3} onCurrentPageChange={() => {}} />);

    expect(readPageLabels(view.container)).toEqual(['1', '2', '3']);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('asks for the next page', () => {
    const onCurrentPageChange = jest.fn();
    view = render(
      <Pagination currentPage={2} elementCount={3} onCurrentPageChange={onCurrentPageChange} />
    );
    clickNextPage(view.container);

    expect(onCurrentPageChange).toHaveBeenCalledWith(3);
  });

  it('renders nothing without props', () => {
    view = render(<Pagination />);

    expect(view.container.innerHTML).toBe('');
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each([
    ['no page', 0],
    ['a negative count', -1],
    ['a count that is not a number', NaN]
  ])('renders nothing for %s', (label, elementCount) => {
    view = render(<Pagination elementCount={elementCount} />);

    expect(view.container.innerHTML).toBe('');
  });

  it('starts on the first page without a current page', () => {
    view = render(<Pagination elementCount={2} />);

    expect(readPageLabels(view.container)).toEqual(['1', '2']);
    expect(view.container.querySelector('.current-page').textContent).toBe('1');
  });

  it('changes nothing on a click without a page change handler', () => {
    view = render(<Pagination currentPage={1} elementCount={2} />);

    expect(() => clickNextPage(view.container)).not.toThrow();
    expect(console.error).not.toHaveBeenCalled();
  });
});
