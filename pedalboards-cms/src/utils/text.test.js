// Utils
import { isNonEmptyText } from './text';

describe('isNonEmptyText', () => {
  it('accepts a text of one character or more', () => {
    expect(isNonEmptyText('a')).toBe(true);
    expect(isNonEmptyText('Plugin non trouvé')).toBe(true);
  });

  it('accepts a text made of spaces', () => {
    expect(isNonEmptyText(' ')).toBe(true);
  });

  it('refuses an empty text', () => {
    expect(isNonEmptyText('')).toBe(false);
  });

  it('refuses a missing value', () => {
    expect(isNonEmptyText()).toBe(false);
    expect(isNonEmptyText(null)).toBe(false);
  });

  it('refuses a value that is not a text', () => {
    expect(isNonEmptyText(404)).toBe(false);
    expect(isNonEmptyText(NaN)).toBe(false);
    expect(isNonEmptyText(['Plugin non trouvé'])).toBe(false);
    expect(isNonEmptyText({ msg: 'Plugin non trouvé' })).toBe(false);
  });
});
