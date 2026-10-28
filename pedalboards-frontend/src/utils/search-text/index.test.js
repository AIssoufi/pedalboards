// Helpers
import { capSearchText } from './index';

// Constants
import { MAX_SEARCH_PATTERN_BYTES, MAX_SEARCH_TEXT_LENGTH } from '../../constants/search';

/** Bytes of the LIKE pattern that the API builds from a text, as it measures them. */
const countApiPatternBytes = text => (
  new TextEncoder().encode(`%${text.replace(/[\\%_]/g, '\\$&')}%`).length
);

describe('capSearchText', () => {
  it('mirrors the 48 one-byte characters that the API accepts', () => {
    expect(MAX_SEARCH_TEXT_LENGTH).toBe(48);
  });

  it.each([
    ['ASCII letters', 'a', 1],
    ['an escaped "%"', '%', 2],
    ['an escaped "_"', '_', 2],
    ['an escaped "\\"', '\\', 2],
    ['a two-byte "é"', 'é', 2],
    ['a three-byte "€"', '€', 3],
    ['a four-byte emoji', '🎸', 4]
  ])('keeps a text of %s at the byte limit, and cuts one more letter', (description, last, bytes) => {
    const text = `${'a'.repeat(MAX_SEARCH_TEXT_LENGTH - bytes)}${last}`;

    expect(countApiPatternBytes(text)).toBe(MAX_SEARCH_PATTERN_BYTES);
    expect(capSearchText(text)).toBe(text);
    expect(capSearchText(`a${text}`)).toBe(`a${text}`.slice(0, -last.length));
  });

  it('cuts a text of two-byte characters to the half of the limit', () => {
    expect(capSearchText('é'.repeat(MAX_SEARCH_TEXT_LENGTH))).toBe('é'.repeat(24));
  });

  it('never cuts an emoji in half', () => {
    const capped = capSearchText(`a${'🎸'.repeat(MAX_SEARCH_TEXT_LENGTH)}`);

    expect(capped).toBe(`a${'🎸'.repeat(11)}`);
    expect(countApiPatternBytes(capped)).toBeLessThanOrEqual(MAX_SEARCH_PATTERN_BYTES);
  });

  it('keeps a shorter text and an empty one as they are', () => {
    expect(capSearchText('MDA 100%')).toBe('MDA 100%');
    expect(capSearchText('')).toBe('');
  });

  it.each([undefined, null, 42, ['a']])('gives an empty text for %p', (value) => {
    expect(capSearchText(value)).toBe('');
  });
});
