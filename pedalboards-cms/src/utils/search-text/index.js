// Constants
import {
  MAX_SEARCH_TEXT_BYTES,
  MAX_UTF8_CHARACTER_BYTES,
  SEARCH_PATTERN_ESCAPE_BYTES,
  SEARCH_PATTERN_ESCAPED_CHARACTERS,
  UTF8_LENGTH_LIMITS
} from './constants';

/**
 * Counts the UTF-8 bytes of one character, as the API measures its LIKE pattern. The jsdom of the
 * tests has no `TextEncoder`, so the count reads the code point.
 * @param {string} character one character, a whole emoji included
 * @returns {number} its UTF-8 bytes, from 1 to 4
 */
const countUtf8Bytes = (character) => {
  const codePoint = character.codePointAt(0);
  const lengthIndex = UTF8_LENGTH_LIMITS.findIndex((limit) => codePoint <= limit);

  return lengthIndex === -1 ? MAX_UTF8_CHARACTER_BYTES : lengthIndex + 1;
};

/**
 * Counts the bytes that one character takes in the LIKE pattern of the API.
 * @param {string} character one character, a whole emoji included
 * @returns {number} its UTF-8 bytes, plus one for the `\` before a `%`, a `_` or a `\`
 */
const countPatternBytes = (character) => {
  const isEscaped = SEARCH_PATTERN_ESCAPED_CHARACTERS.includes(character);

  return countUtf8Bytes(character) + (isEscaped ? SEARCH_PATTERN_ESCAPE_BYTES : 0);
};

/**
 * Shortens a searched text to the longest start that the API accepts: the LIKE pattern that it
 * builds from the text holds `MAX_SEARCH_PATTERN_BYTES` UTF-8 bytes at most. A character is never
 * cut in half.
 * @param {*} text searched text
 * @returns {string} the text, or its longest start that fits the pattern; an empty text for a
 *   value that is not a string
 *
 * @example
 * capSearchText('a'.repeat(60)).length; // 48
 * capSearchText('é'.repeat(30)).length; // 24, two bytes each
 */
export const capSearchText = (text) => {
  if (typeof text !== 'string') return '';

  let usedBytes = 0;
  let cappedText = '';

  // A for...of loop reads whole characters, an emoji written with two code units included
  for (const character of text) {
    usedBytes += countPatternBytes(character);
    if (usedBytes > MAX_SEARCH_TEXT_BYTES) break;
    cappedText += character;
  }

  return cappedText;
};
