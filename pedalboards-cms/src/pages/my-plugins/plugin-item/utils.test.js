// Utils
import { isFilledText, toPluginActionLabel } from './utils';

describe('isFilledText', () => {
  it.each(['Gate', ' Gate ', 'a'])('accepts the text %p', (value) => {
    expect(isFilledText(value)).toBe(true);
  });

  it.each([
    ['an empty text', ''],
    ['a text of spaces', '   '],
    ['a number', 42],
    ['null', null],
    ['a missing value', undefined],
    ['an object', {}]
  ])('refuses %s', (label, value) => {
    expect(isFilledText(value)).toBe(false);
  });
});

describe('toPluginActionLabel', () => {
  it('names the plugin that the action acts on', () => {
    expect(toPluginActionLabel({ action: 'Edit', pluginName: 'Gate' })).toBe('Edit Gate');
  });

  it('trims the spaces around the name of the plugin', () => {
    expect(toPluginActionLabel({ action: 'Delete', pluginName: ' Gate  ' }))
      .toBe('Delete Gate');
  });

  it.each([
    ['an empty name', ''],
    ['a name of spaces', '   '],
    ['a missing name', undefined],
    ['null', null],
    ['a number', 42]
  ])('keeps the action alone for %s', (label, pluginName) => {
    expect(toPluginActionLabel({ action: 'Edit', pluginName })).toBe('Edit');
  });

  it('says that the action opens a new tab', () => {
    expect(toPluginActionLabel({ action: 'View', pluginName: 'Gate', opensInNewTab: true }))
      .toBe('View Gate (new tab)');
  });

  it('says that the action opens a new tab for a plugin without a name', () => {
    expect(toPluginActionLabel({ action: 'View', opensInNewTab: true }))
      .toBe('View (new tab)');
  });

  it.each([
    ['the name alone without an action', { pluginName: 'Gate' }, 'Gate'],
    ['the name alone for an empty action', { action: '', pluginName: 'Gate' }, 'Gate'],
    ['the name alone for a null action', { action: null, pluginName: 'Gate' }, 'Gate'],
    ['the new tab note alone without an action or a name', { opensInNewTab: true },
      '(new tab)'],
    ['the name and the new tab note without an action',
      { pluginName: 'Gate', opensInNewTab: true }, 'Gate (new tab)']
  ])('gives %s, without spaces around', (label, params, expected) => {
    expect(toPluginActionLabel(params)).toBe(expected);
  });

  it('gives an empty label without parameters', () => {
    expect(toPluginActionLabel()).toBe('');
  });
});
