// Utils
import { isPageInRange } from './utils';

describe('isPageInRange', () => {
  it.each([
    ['the first page', 1],
    ['a middle page', 2],
    ['the last page', 3]
  ])('accepts %s', (label, page) => {
    expect(isPageInRange({ page, pageCount: 3 })).toBe(true);
  });

  it.each([
    ['the page before the first one', 0],
    ['the page after the last one', 4],
    ['a negative page', -1],
    ['a page that is not a whole number', 1.5],
    ['a page that is not a number', NaN],
    ['a page given as text', '2'],
    ['a missing page', undefined]
  ])('refuses %s', (label, page) => {
    expect(isPageInRange({ page, pageCount: 3 })).toBe(false);
  });

  it.each([
    ['no page', 0],
    ['a count that is not a number', NaN],
    ['a missing count', undefined]
  ])('refuses every page of a list with %s', (label, pageCount) => {
    expect(isPageInRange({ page: 1, pageCount })).toBe(false);
  });

  it('refuses every page without parameters', () => {
    expect(isPageInRange()).toBe(false);
  });
});
