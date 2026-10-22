// Utils
import {
  isPageInRange, readLoadedPage, readPageCount, toPluginActionLabel
} from './utils';

describe('readPageCount', () => {
  it.each([0, 1, 3, 54])('keeps a count of %i pages', (numberPages) => {
    expect(readPageCount(numberPages)).toBe(numberPages);
  });

  it.each([
    ['a negative count', -1],
    ['a count that is not a whole number', 2.5],
    ['a count that is not a number', NaN],
    ['a count given as text', '3'],
    ['null', null],
    ['a missing count', undefined]
  ])('gives an unknown count for %s', (label, numberPages) => {
    expect(readPageCount(numberPages)).toBe(0);
  });
});

describe('readLoadedPage', () => {
  it.each([1, 2, 54])('keeps the loaded page %i', (loadedPage) => {
    expect(readLoadedPage({ loadedPage, page: 3 })).toBe(loadedPage);
  });

  it.each([
    ['the page before the first one', 0],
    ['a negative page', -1],
    ['a page that is not a whole number', 1.5],
    ['a page that is not a number', NaN],
    ['a page given as text', '2'],
    ['null', null],
    ['a missing page', undefined]
  ])('gives the page asked for instead of %s', (label, loadedPage) => {
    expect(readLoadedPage({ loadedPage, page: 3 })).toBe(3);
  });

  it('gives no page without parameters', () => {
    expect(readLoadedPage()).toBeUndefined();
  });
});

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

describe('toPluginActionLabel', () => {
  it('names the plugin that the action acts on', () => {
    expect(toPluginActionLabel({ action: 'Éditer', pluginName: 'Gate' })).toBe('Éditer Gate');
  });

  it('trims the spaces around the name of the plugin', () => {
    expect(toPluginActionLabel({ action: 'Supprimer', pluginName: ' Gate  ' }))
      .toBe('Supprimer Gate');
  });

  it.each([
    ['an empty name', ''],
    ['a name of spaces', '   '],
    ['a missing name', undefined],
    ['null', null],
    ['a number', 42]
  ])('keeps the action alone for %s', (label, pluginName) => {
    expect(toPluginActionLabel({ action: 'Éditer', pluginName })).toBe('Éditer');
  });

  it('says that the action opens a new tab', () => {
    expect(toPluginActionLabel({ action: 'Voir', pluginName: 'Gate', opensInNewTab: true }))
      .toBe('Voir Gate (nouvel onglet)');
  });

  it('says that the action opens a new tab for a plugin without a name', () => {
    expect(toPluginActionLabel({ action: 'Voir', opensInNewTab: true }))
      .toBe('Voir (nouvel onglet)');
  });

  it.each([
    ['the name alone without an action', { pluginName: 'Gate' }, 'Gate'],
    ['the name alone for an empty action', { action: '', pluginName: 'Gate' }, 'Gate'],
    ['the name alone for a null action', { action: null, pluginName: 'Gate' }, 'Gate'],
    ['the new tab note alone without an action or a name', { opensInNewTab: true },
      '(nouvel onglet)'],
    ['the name and the new tab note without an action',
      { pluginName: 'Gate', opensInNewTab: true }, 'Gate (nouvel onglet)']
  ])('gives %s, without spaces around', (label, params, expected) => {
    expect(toPluginActionLabel(params)).toBe(expected);
  });

  it('gives an empty label without parameters', () => {
    expect(toPluginActionLabel()).toBe('');
  });
});
