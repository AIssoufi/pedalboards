import { isControlPort, toCellText } from './utils';

describe('isControlPort', () => {
  it.each([{}, { name: 'Gain', default: 1 }])('accepts %p', (value) => {
    expect(isControlPort(value)).toBe(true);
  });

  it.each([undefined, null, 'Gain', 1, true])('refuses %p', (value) => {
    expect(isControlPort(value)).toBe(false);
  });
});

describe('toCellText', () => {
  it.each(['Gain', '', 0, -1, 0.5])('keeps %p', (value) => {
    expect(toCellText(value)).toBe(value);
  });

  it.each([undefined, null, NaN, Infinity, true, { en: 'Gain' }, ['Gain']])(
    'gives an empty text for %p',
    (value) => {
      expect(toCellText(value)).toBe('');
    }
  );
});
