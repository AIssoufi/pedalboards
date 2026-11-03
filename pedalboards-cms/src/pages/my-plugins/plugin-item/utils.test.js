// Utils
import { toPluginActionLabel, toPluginNames } from './utils';

describe('toPluginNames', () => {
  it('gives the label as the title and the name below it', () => {
    expect(toPluginNames({ label: 'Ambience', name: 'MDA Ambience' }))
      .toEqual({ title: 'Ambience', subtitle: 'MDA Ambience' });
  });

  it('trims the label and the name', () => {
    expect(toPluginNames({ label: '  Ambience ', name: ' MDA Ambience  ' }))
      .toEqual({ title: 'Ambience', subtitle: 'MDA Ambience' });
  });

  it.each([
    ['the same as the label', { label: 'abGate', name: 'abGate' }],
    ['the same as the label once trimmed', { label: 'abGate', name: ' abGate ' }]
  ])('shows no subtitle for a name %s', (label, plugin) => {
    expect(toPluginNames(plugin)).toEqual({ title: 'abGate', subtitle: '' });
  });

  it.each([
    ['without a label', { name: 'Gate' }],
    ['with an empty label', { label: '', name: 'Gate' }],
    ['with a blank label', { label: '   ', name: 'Gate' }],
    ['with a null label', { label: null, name: 'Gate' }],
    ['with a label that is not a text', { label: 42, name: 'Gate' }]
  ])('gives the name as the title, and no subtitle, %s', (label, plugin) => {
    expect(toPluginNames(plugin)).toEqual({ title: 'Gate', subtitle: '' });
  });

  it.each([
    ['without a label or a name', {}],
    ['with a blank label and a blank name', { label: ' ', name: ' ' }],
    ['with values that are not texts', { label: ['Gate'], name: { text: 'Gate' } }]
  ])('gives a fallback title, and no subtitle, %s', (label, plugin) => {
    expect(toPluginNames(plugin)).toEqual({ title: 'Untitled plugin', subtitle: '' });
  });

  it('shows the name below a label that differs from it by case only', () => {
    expect(toPluginNames({ label: 'gate', name: 'Gate' }))
      .toEqual({ title: 'gate', subtitle: 'Gate' });
  });

  it('keeps the label as the title without a name', () => {
    expect(toPluginNames({ label: 'Ambience' })).toEqual({ title: 'Ambience', subtitle: '' });
  });

  it('gives a fallback title without a plugin', () => {
    expect(toPluginNames()).toEqual({ title: 'Untitled plugin', subtitle: '' });
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
