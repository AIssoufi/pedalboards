import { hasPluginFilters, toPluginsPage } from './utils';

const PLUGIN = { _id: 'abgate', label: 'Gate' };

describe('toPluginsPage', () => {
  it('reads the plugins and the number of pages of an answer', () => {
    expect(toPluginsPage({ data: [PLUGIN], count: 1, numberPages: 3 }))
      .toEqual({ plugins: [PLUGIN], pageCount: 3 });
  });

  it.each([
    ['no answer', undefined],
    ['null', null],
    ['a text', 'error'],
    ['an empty object', {}]
  ])('gives an empty page for %s', (description, answer) => {
    expect(toPluginsPage(answer)).toEqual({ plugins: [], pageCount: 0 });
  });

  it('keeps only the objects of the data', () => {
    expect(toPluginsPage({ data: [PLUGIN, null, 'x', 2, undefined], numberPages: 1 }).plugins)
      .toEqual([PLUGIN]);
  });

  it.each([
    ['a negative number', -1],
    ['a fraction', 1.5],
    ['a text', '2'],
    ['NaN', Number.NaN],
    ['Infinity', Infinity]
  ])('gives 0 pages for %s', (description, numberPages) => {
    expect(toPluginsPage({ data: [], numberPages }).pageCount).toBe(0);
  });

  it('keeps 0 pages', () => {
    expect(toPluginsPage({ data: [], numberPages: 0 }).pageCount).toBe(0);
  });
});

describe('hasPluginFilters', () => {
  it('is true for filters with an entry', () => {
    expect(hasPluginFilters(new URLSearchParams('brand=MDA'))).toBe(true);
  });

  it.each([
    ['empty filters', new URLSearchParams()],
    ['no filters', undefined],
    ['an object', { brand: 'MDA' }],
    ['a query string', 'brand=MDA']
  ])('is false for %s', (description, filters) => {
    expect(hasPluginFilters(filters)).toBe(false);
  });
});
