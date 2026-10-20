// Dependencies
import React from 'react';
import ReactDOM from 'react-dom';

// Components
import Pagination from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Pagination
    currentPage={6}
    elementCount={54}
    onCurrentPageChange={() => { }}
  />, div);
  ReactDOM.unmountComponentAtNode(div);
});

describe('Pagination', () => {
  let div;

  const getItemTexts = () => [...div.querySelectorAll('.numero-de-page > *')]
    .map(item => item.textContent);

  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
    div.remove();
    console.error.mockRestore();
  });

  it('shows the first, nearby and last pages with a gap for the others', () => {
    ReactDOM.render(<Pagination currentPage={6} elementCount={54} />, div);

    expect(getItemTexts()).toEqual(['1', '...', '5', '6', '7', '...', '54']);
    expect(div.querySelector('.current-page').textContent).toBe('6');
    expect([...div.querySelectorAll('.gap')].map(gap => gap.tagName)).toEqual(['SPAN', 'SPAN']);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('shows each page of a short list once', () => {
    ReactDOM.render(<Pagination currentPage={1} elementCount={3} />, div);

    expect(getItemTexts()).toEqual(['1', '2', '3']);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('calls back with the page number that is clicked', () => {
    const onCurrentPageChange = vi.fn();
    ReactDOM.render(
      <Pagination currentPage={6} elementCount={54} onCurrentPageChange={onCurrentPageChange} />,
      div
    );

    const lastPage = [...div.querySelectorAll('button')]
      .find(button => button.textContent === '54');
    lastPage.click();
    div.querySelector('.page-precedente').click();
    div.querySelector('.page-suivante').click();

    expect(onCurrentPageChange.mock.calls).toEqual([[54], [5], [7]]);
  });

  it('renders nothing without props', () => {
    ReactDOM.render(<Pagination />, div);

    expect(div.innerHTML).toBe('');
  });

  it.each([0, -1, NaN, 2.5])('renders nothing for %p pages', (elementCount) => {
    ReactDOM.render(<Pagination currentPage={1} elementCount={elementCount} />, div);

    expect(div.innerHTML).toBe('');
  });

  it('shows the first page and clicks safely without a valid page or a callback', () => {
    ReactDOM.render(<Pagination currentPage={NaN} elementCount={3} />, div);

    expect(div.querySelector('.current-page').textContent).toBe('1');
    expect(() => div.querySelector('.page-suivante').click()).not.toThrow();
  });
});
