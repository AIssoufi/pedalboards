// Utils
import { capSearchText } from '.';

// Constants
import { MAX_SEARCH_TEXT_BYTES } from './constants';

describe('capSearchText', () => {
  it('keeps a text at the limit', () => {
    const text = 'a'.repeat(MAX_SEARCH_TEXT_BYTES);

    expect(capSearchText(text)).toBe(text);
  });

  it('drops the character one byte over the limit', () => {
    const text = 'a'.repeat(MAX_SEARCH_TEXT_BYTES);

    expect(capSearchText(`${text}a`)).toBe(text);
  });

  it('keeps a short text and an empty one', () => {
    expect(capSearchText('gate')).toBe('gate');
    expect(capSearchText('')).toBe('');
  });

  it.each(['%', '_', '\\'])('counts the escape of %s as one more byte', (character) => {
    const atLimit = character.repeat(MAX_SEARCH_TEXT_BYTES / 2);

    expect(capSearchText(atLimit)).toBe(atLimit);
    expect(capSearchText(`${atLimit}${character}`)).toBe(atLimit);
    expect(capSearchText(`${'a'.repeat(MAX_SEARCH_TEXT_BYTES - 1)}${character}`))
      .toBe('a'.repeat(MAX_SEARCH_TEXT_BYTES - 1));
  });

  it('counts é as two bytes and never cuts it', () => {
    const atLimit = 'é'.repeat(MAX_SEARCH_TEXT_BYTES / 2);

    expect(capSearchText(`${atLimit}é`)).toBe(atLimit);
    expect(capSearchText(`${'a'.repeat(MAX_SEARCH_TEXT_BYTES - 1)}é`))
      .toBe('a'.repeat(MAX_SEARCH_TEXT_BYTES - 1));
  });

  it('counts three and four byte characters', () => {
    expect(capSearchText('€'.repeat(MAX_SEARCH_TEXT_BYTES)))
      .toBe('€'.repeat(MAX_SEARCH_TEXT_BYTES / 3));
    expect(capSearchText('🎸'.repeat(MAX_SEARCH_TEXT_BYTES)))
      .toBe('🎸'.repeat(MAX_SEARCH_TEXT_BYTES / 4));
  });

  it('never cuts an emoji that the bytes left cannot hold', () => {
    const fittingEmojis = '🎸'.repeat(MAX_SEARCH_TEXT_BYTES / 4 - 1);

    expect(capSearchText(`a${'🎸'.repeat(MAX_SEARCH_TEXT_BYTES)}`)).toBe(`a${fittingEmojis}`);
  });

  it('gives an empty text for a value that is not a text', () => {
    expect(capSearchText()).toBe('');
    expect(capSearchText(null)).toBe('');
    expect(capSearchText(48)).toBe('');
    expect(capSearchText(['gate'])).toBe('');
  });
});
