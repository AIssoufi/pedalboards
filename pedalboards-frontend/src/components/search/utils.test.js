import { isTextOfValue, toSearchField, toSearchText } from './utils';

describe('toSearchField', () => {
  it.each(['name', 'brand', 'categories', 'label'])('keeps the field %s', (field) => {
    expect(toSearchField(field)).toBe(field);
  });

  it.each([
    ['no field', undefined],
    ['null', null],
    ['an unknown field', 'title'],
    ['a field in another case', 'Label'],
    ['a number', 1]
  ])('gives name for %s', (description, field) => {
    expect(toSearchField(field)).toBe('name');
  });
});

describe('toSearchText', () => {
  it('keeps a text', () => {
    expect(toSearchText('A&B')).toBe('A&B');
  });

  it.each([
    ['no value', undefined],
    ['null', null],
    ['a number', 2],
    ['an object', {}]
  ])('gives an empty text for %s', (description, value) => {
    expect(toSearchText(value)).toBe('');
  });
});

describe('isTextOfValue', () => {
  it.each([
    ['the same text', 'Gx', 'Gx'],
    ['a text with spaces around', ' Gx ', 'Gx'],
    ['blank text for no value', '   ', '']
  ])('is true for %s', (description, text, value) => {
    expect(isTextOfValue({ text, value })).toBe(true);
  });

  it.each([
    ['another text', 'Gx2', 'Gx'],
    ['a text in another case', 'gx', 'Gx'],
    ['a text for no value', 'Gx', '']
  ])('is false for %s', (description, text, value) => {
    expect(isTextOfValue({ text, value })).toBe(false);
  });
});
