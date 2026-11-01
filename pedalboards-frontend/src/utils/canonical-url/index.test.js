// Utils
import { buildCanonicalUrl } from '.';

const LIST_URL = 'https://pedalboards.issoufi.fr/plugins';

describe('buildCanonicalUrl', () => {
  it('puts the path on the deployed site', () => {
    const url = buildCanonicalUrl('/plugin/abgate');

    expect(url).toBe('https://pedalboards.issoufi.fr/plugin/abgate');
  });

  it.each([
    ['a query string', '/plugins?brand=MDA&page=2'],
    ['an empty query string', '/plugins?'],
    ['a fragment', '/plugins#top'],
    ['a query string and a fragment', '/plugins?page=2#top'],
    ['a query string over two lines', '/plugins?a=1\nb=2'],
    ['spaces around it', '  /plugins  '],
    ['spaces before a query string', '/plugins ?a=1']
  ])('drops %s', (_case, pathname) => {
    expect(buildCanonicalUrl(pathname)).toBe(LIST_URL);
  });

  it('keeps an encoded question mark, which belongs to the id', () => {
    expect(buildCanonicalUrl('/plugin/a%3Fb')).toBe('https://pedalboards.issoufi.fr/plugin/a%3Fb');
  });

  it.each([
    ['an empty path', ''],
    ['a blank path', '   '],
    ['a query string alone', '?page=2'],
    ['a relative path', 'plugin/abgate'],
    ['an address of another site', 'https://example.com/x'],
    ['a missing path', undefined],
    ['a null path', null],
    ['a number', 42],
    ['an object', { pathname: '/plugins' }]
  ])('gives the list of the plugins for %s', (_case, pathname) => {
    expect(buildCanonicalUrl(pathname)).toBe(LIST_URL);
  });

  it('gives the list of the plugins when called without an argument', () => {
    expect(buildCanonicalUrl()).toBe(LIST_URL);
  });
});
