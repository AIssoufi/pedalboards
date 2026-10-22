// Constants
import { ELLIPSIS } from './constants';

// Utils
import { getRightPageNumbers } from './utils';

describe('getRightPageNumbers', () => {
  it.each([
    [1, 1, []],
    [1, 2, [2]],
    [2, 2, []],
    [1, 3, [2, 3]],
    [2, 3, [3]],
    [3, 3, []],
    [1, 4, [2, 3, 4]],
    [2, 4, [3, 4]],
    [3, 4, [4]],
    [4, 4, []],
    [1, 5, [2, 3, ELLIPSIS, 5]],
    [2, 5, [3, ELLIPSIS, 5]],
    [3, 5, [4, 5]],
    [4, 5, [5]],
    [5, 5, []]
  ])('lists the pages after page %i of %i', (currentPage, pageCount, expected) => {
    expect(getRightPageNumbers({ currentPage, pageCount })).toEqual(expected);
  });

  it('hides the pages between the next one and the last one of a long list', () => {
    expect(getRightPageNumbers({ currentPage: 6, pageCount: 54 })).toEqual([7, ELLIPSIS, 54]);
  });

  it.each([
    ['a current page after the last one', { currentPage: 4, pageCount: 3 }],
    ['a current page before the first one', { currentPage: 0, pageCount: 3 }],
    ['a current page that is not a number', { currentPage: NaN, pageCount: 3 }],
    ['a current page that is not a whole number', { currentPage: 1.5, pageCount: 3 }],
    ['a missing current page', { pageCount: 3 }],
    ['no page', { currentPage: 1, pageCount: 0 }],
    ['a page count that is not a number', { currentPage: 1, pageCount: NaN }],
    ['a missing page count', { currentPage: 1 }]
  ])('lists no page for %s', (label, params) => {
    expect(getRightPageNumbers(params)).toEqual([]);
  });

  it('lists no page without parameters', () => {
    expect(getRightPageNumbers()).toEqual([]);
  });
});
