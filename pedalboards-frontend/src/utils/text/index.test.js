import { isNonBlankText } from './index';

describe('isNonBlankText', () => {
  it.each(['abGate', ' CS Chorus 1 ', 'a', '0'])('accepts the text %p', (value) => {
    expect(isNonBlankText(value)).toBe(true);
  });

  it.each(['', ' ', '   ', '\n\t'])('refuses the blank text %p', (value) => {
    expect(isNonBlankText(value)).toBe(false);
  });

  it.each([undefined, null, 0, 42, Number.NaN, true, {}, ['abGate'], new String('abGate')])(
    'refuses %p, which is not a text',
    (value) => {
      expect(isNonBlankText(value)).toBe(false);
    }
  );
});
