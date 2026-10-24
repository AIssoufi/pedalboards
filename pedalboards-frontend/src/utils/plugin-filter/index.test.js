// Helpers
import {
  buildLastPageSearch,
  buildPluginFilterLink,
  buildPluginsSearch,
  createPluginFilters,
  getSearchFilter,
  isPluginFilterValue,
  isValidPage,
  parsePluginsSearch
} from './index';

const entriesOf = searchParams => [...searchParams.entries()];

describe('createPluginFilters', () => {
  it('keeps a known field with its value', () => {
    expect(entriesOf(createPluginFilters({ field: 'brand', value: 'MDA' })))
      .toEqual([['brand', 'MDA']]);
  });

  it('drops the spaces around the value', () => {
    expect(entriesOf(createPluginFilters({ field: 'label', value: '  Gx  ' })))
      .toEqual([['label', 'Gx']]);
  });

  it.each([
    ['an unknown field', { field: 'name', value: 'MDA' }],
    ['a missing field', { value: 'MDA' }],
    ['an empty value', { field: 'brand', value: '' }],
    ['a blank value', { field: 'brand', value: '   ' }],
    ['a missing value', { field: 'brand' }],
    ['a null value', { field: 'brand', value: null }],
    ['a value that is not a string', { field: 'brand', value: 42 }]
  ])('gives no filter for %s', (description, params) => {
    expect(entriesOf(createPluginFilters(params))).toEqual([]);
  });

  it('gives no filter without params', () => {
    expect(entriesOf(createPluginFilters())).toEqual([]);
  });
});

describe('isPluginFilterValue', () => {
  it.each(['Delay', ' Gx ', 'C++'])('accepts %p', (value) => {
    expect(isPluginFilterValue(value)).toBe(true);
  });

  it.each(['', '   ', undefined, null, 42, ['Delay'], {}])('refuses %p', (value) => {
    expect(isPluginFilterValue(value)).toBe(false);
  });
});

describe('buildPluginsSearch', () => {
  it('keeps the filters and the page', () => {
    const filters = new URLSearchParams([['brand', 'MDA']]);

    expect(buildPluginsSearch({ filters, page: 3 })).toBe('?brand=MDA&page=3');
  });

  it('omits the first page', () => {
    const filters = new URLSearchParams([['brand', 'MDA']]);

    expect(buildPluginsSearch({ filters, page: 1 })).toBe('?brand=MDA');
  });

  it('gives an empty string without filters on the first page', () => {
    expect(buildPluginsSearch({})).toBe('');
  });

  it('keeps the page without filters', () => {
    expect(buildPluginsSearch({ page: 2 })).toBe('?page=2');
  });

  it('gives an empty string without params', () => {
    expect(buildPluginsSearch()).toBe('');
  });

  it.each([NaN, 0, -1, 2.5, null, '2'])('omits the page %p, which is not a page number', (page) => {
    const filters = new URLSearchParams([['brand', 'MDA']]);

    expect(buildPluginsSearch({ filters, page })).toBe('?brand=MDA');
  });

  it('leaves the filters it was given untouched', () => {
    const filters = new URLSearchParams([['brand', 'MDA']]);

    buildPluginsSearch({ filters, page: 2 });

    expect(filters.toString()).toBe('brand=MDA');
  });

  it.each([
    ['null', null],
    ['a string', 'brand=MDA'],
    ['an object', { brand: 'MDA' }],
    ['an array', [['brand', 'MDA']]],
    ['a number', 3]
  ])('keeps no filter from %s', (description, filters) => {
    expect(buildPluginsSearch({ filters, page: 2 })).toBe('?page=2');
  });
});

describe('buildPluginFilterLink', () => {
  it('links to all the plugins without params', () => {
    expect(buildPluginFilterLink()).toEqual({ pathname: '/plugins', search: '' });
  });

  it('links to the plugins page filtered on the value', () => {
    expect(buildPluginFilterLink({ field: 'categories', value: 'Delay' }))
      .toEqual({ pathname: '/plugins', search: '?categories=Delay' });
  });

  it.each([
    ['A&B', 'brand', '?brand=A%26B'],
    ['C++', 'label', '?label=C%2B%2B'],
    ['Gate Dynamics', 'categories', '?categories=Gate+Dynamics'],
    ['50%=half#1', 'brand', '?brand=50%25%3Dhalf%231'],
    ['Éffets', 'label', '?label=%C3%89ffets']
  ])('encodes %j', (value, field, search) => {
    expect(buildPluginFilterLink({ field, value }).search).toBe(search);
  });

  it.each(['A&B', 'C++', 'Gate Dynamics', '50%=half#1'])(
    'gives back %j when the plugins page reads the link',
    (value) => {
      const { search } = buildPluginFilterLink({ field: 'brand', value });

      expect(entriesOf(parsePluginsSearch(search).filters)).toEqual([['brand', value]]);
    }
  );

  it.each([
    ['an empty value', { field: 'brand', value: '' }],
    ['a missing value', { field: 'brand' }],
    ['an unknown field', { field: 'name', value: 'MDA' }]
  ])('links to the unfiltered plugins page for %s', (description, params) => {
    expect(buildPluginFilterLink(params)).toEqual({ pathname: '/plugins', search: '' });
  });
});

describe('parsePluginsSearch', () => {
  it('reads the filter and the page', () => {
    const { filters, page } = parsePluginsSearch('?brand=MDA&page=2');

    expect(entriesOf(filters)).toEqual([['brand', 'MDA']]);
    expect(page).toBe(2);
  });

  it('reads the first page when the page is missing', () => {
    expect(parsePluginsSearch('?brand=MDA').page).toBe(1);
  });

  it.each(['0', '-1', '2.5', 'abc', '', 'Infinity'])(
    'reads the first page for the invalid page %j',
    (page) => {
      expect(parsePluginsSearch(`?page=${page}`).page).toBe(1);
    }
  );

  it('ignores the unknown parameters and the blank values', () => {
    const { filters } = parsePluginsSearch('?utm_source=x&label=&brand=%20&categories=Gate');

    expect(entriesOf(filters)).toEqual([['categories', 'Gate']]);
  });

  it.each([undefined, null, '', 42])('gives no filter and the first page for %j', (search) => {
    const { filters, page } = parsePluginsSearch(search);

    expect(entriesOf(filters)).toEqual([]);
    expect(page).toBe(1);
  });
});

describe('isValidPage', () => {
  it.each([
    [1, 3, true],
    [3, 3, true],
    [0, 3, false],
    [4, 3, false],
    [-1, 3, false],
    [1.5, 3, false],
    [NaN, 3, false],
    ['2', 3, false],
    [1, 0, false],
    [1, -1, false]
  ])('tells whether page %j of %j pages is valid: %j', (page, pageCount, expected) => {
    expect(isValidPage({ page, pageCount })).toBe(expected);
  });

  it('refuses a missing page', () => {
    expect(isValidPage()).toBe(false);
  });
});

describe('buildLastPageSearch', () => {
  const filters = new URLSearchParams('brand=MDA');

  it('sends a page past the count to the last page, with the filters', () => {
    expect(buildLastPageSearch({ filters, page: 999, pageCount: 5 })).toBe('?brand=MDA&page=5');
  });

  it('sends the page just past the last one to the last page', () => {
    expect(buildLastPageSearch({ page: 6, pageCount: 5 })).toBe('?page=5');
  });

  it.each([
    [5, 5],
    [4, 5],
    [1, 5]
  ])('keeps page %j of %j pages', (page, pageCount) => {
    expect(buildLastPageSearch({ filters, page, pageCount })).toBeNull();
  });

  it.each([
    [0, ''],
    [1, '']
  ])('sends a later page of %j pages to the first page, which has no page parameter', (pageCount, expected) => {
    expect(buildLastPageSearch({ page: 3, pageCount })).toBe(expected);
  });

  it('keeps the filters on the first page of an empty list', () => {
    expect(buildLastPageSearch({ filters, page: 3, pageCount: 0 })).toBe('?brand=MDA');
  });

  it.each([
    [1, 0],
    [1, 1]
  ])('keeps the first page of %j pages', (page, pageCount) => {
    expect(buildLastPageSearch({ page, pageCount })).toBeNull();
  });

  it.each([0, -3, 1.5, NaN, '9', null, undefined])('ignores the page %j', (page) => {
    expect(buildLastPageSearch({ page, pageCount: 5 })).toBeNull();
  });

  it.each([-1, 2.5, NaN, '3', null, undefined])('ignores the page count %j', (pageCount) => {
    expect(buildLastPageSearch({ page: 9, pageCount })).toBeNull();
  });

  it('ignores missing parameters', () => {
    expect(buildLastPageSearch()).toBeNull();
  });
});

describe('getSearchFilter', () => {
  it('gives the field and the value of the filter', () => {
    expect(getSearchFilter(new URLSearchParams('label=Gx'))).toEqual({ field: 'label', value: 'Gx' });
  });

  it('gives the first filter of several', () => {
    expect(getSearchFilter(new URLSearchParams('brand=MDA&label=Gx')))
      .toEqual({ field: 'brand', value: 'MDA' });
  });

  it('keeps the characters that the URL encodes', () => {
    expect(getSearchFilter(new URLSearchParams('brand=A%26B'))).toEqual({ field: 'brand', value: 'A&B' });
  });

  it.each([
    ['empty filters', new URLSearchParams()],
    ['no filters', undefined],
    ['null', null],
    ['a query string', 'brand=MDA'],
    ['an object', { brand: 'MDA' }]
  ])('gives an empty object for %s', (description, filters) => {
    expect(getSearchFilter(filters)).toEqual({});
  });
});
