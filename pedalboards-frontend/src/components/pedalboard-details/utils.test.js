import { hasPedalboards, isControlPort, toCellText } from './utils';

describe('isControlPort', () => {
  it.each([{}, { name: 'Gain', default: 1 }])('accepts %p', (value) => {
    expect(isControlPort(value)).toBe(true);
  });

  it.each([undefined, null, 'Gain', 1, true])('refuses %p', (value) => {
    expect(isControlPort(value)).toBe(false);
  });
});

describe('toCellText', () => {
  it.each(['Gain', '', '0.10000000149011612'])('keeps the text %p', (value) => {
    expect(toCellText(value)).toBe(value);
  });

  it.each([
    [0.10000000149011612, '0.1'],
    [0.5, '0.5'],
    [0.1234, '0.1234'],
    [0.12345, '0.1235'],
    [0.99999, '1'],
    [0.00004, '0'],
    [4000, '4000'],
    [-70, '-70'],
    [-0.25, '-0.25'],
    [0, '0'],
    [-0, '0'],
    [-0.00001, '0'],
    [Number.MAX_SAFE_INTEGER, '9007199254740991']
  ])('writes %p as %p', (value, text) => {
    expect(toCellText(value)).toBe(text);
  });

  it.each([undefined, null, NaN, Infinity, true, { en: 'Gain' }, ['Gain']])(
    'gives an empty text for %p',
    (value) => {
      expect(toCellText(value)).toBe('');
    }
  );
});

describe('hasPedalboards', () => {
  it.each([1, 42, 0.5])('accepts %p', (value) => {
    expect(hasPedalboards(value)).toBe(true);
  });

  it.each([0, -1, NaN, Infinity, undefined, null, 'abc', '3'])('refuses %p', (value) => {
    expect(hasPedalboards(value)).toBe(false);
  });
});
