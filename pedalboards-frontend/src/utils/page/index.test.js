import { isPageNumber } from './index';

describe('isPageNumber', () => {
  it.each([1, 2, 54])('accepts %p', (value) => {
    expect(isPageNumber(value)).toBe(true);
  });

  it.each([undefined, null, 0, -1, 1.5, NaN, Infinity, '2', {}])('refuses %p', (value) => {
    expect(isPageNumber(value)).toBe(false);
  });
});
