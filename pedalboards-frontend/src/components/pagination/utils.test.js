import { PAGE_GAP } from './constants';
import { getPageItems } from './utils';

describe('getPageItems', () => {
  it.each([
    [1, 1, [1]],
    [1, 2, [1, 2]],
    [1, 3, [1, 2, 3]],
    [2, 3, [1, 2, 3]],
    [3, 3, [1, 2, 3]],
    [1, 4, [1, 2, 3, 4]],
    [1, 5, [1, 2, PAGE_GAP, 5]],
    [3, 5, [1, 2, 3, 4, 5]],
    [5, 5, [1, PAGE_GAP, 4, 5]],
    [4, 7, [1, 2, 3, 4, 5, 6, 7]],
    [6, 54, [1, PAGE_GAP, 5, 6, 7, PAGE_GAP, 54]],
    [54, 54, [1, PAGE_GAP, 53, 54]]
  ])('lists page %i of %i as %j', (currentPage, pageCount, expected) => {
    expect(getPageItems({ currentPage, pageCount })).toEqual(expected);
  });

  it('shows each page once, with a gap only where at least two pages are hidden', () => {
    for (let pageCount = 1; pageCount <= 12; pageCount += 1) {
      for (let currentPage = 1; currentPage <= pageCount; currentPage += 1) {
        const items = getPageItems({ currentPage, pageCount });
        const pages = items.filter(item => item !== PAGE_GAP);

        expect(pages).toEqual([...new Set(pages)].sort((a, b) => a - b));
        expect(pages[0]).toBe(1);
        expect(pages[pages.length - 1]).toBe(pageCount);
        expect(pages).toContain(currentPage);
        items.forEach((item, index) => {
          if (item !== PAGE_GAP) return;
          expect(items[index + 1] - items[index - 1]).toBeGreaterThan(2);
        });
      }
    }
  });

  it('keeps the pages before a current page past the last one within the page count', () => {
    expect(getPageItems({ currentPage: 9, pageCount: 5 })).toEqual([1, PAGE_GAP, 5, 9]);
  });

  it.each([undefined, null, 0, 1.5, 'abc'])('starts on the first page for %p', (currentPage) => {
    expect(getPageItems({ currentPage, pageCount: 5 })).toEqual([1, 2, PAGE_GAP, 5]);
  });

  it.each([undefined, null, 0, -1, 2.5, NaN, '5'])('lists nothing for %p pages', (pageCount) => {
    expect(getPageItems({ currentPage: 1, pageCount })).toEqual([]);
  });
});
