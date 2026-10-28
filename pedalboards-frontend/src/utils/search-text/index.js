// Constants
import {
  MAX_SEARCH_TEXT_BYTES, SEARCH_PATTERN_ESCAPE_BYTES, SEARCH_PATTERN_ESCAPED_CHARACTERS
} from '../../constants/search';

/** Encoder that counts the UTF-8 bytes of a character, as the API measures its LIKE pattern. */
const utf8Encoder = new TextEncoder();

/**
 * Counts the bytes that one character takes in the LIKE pattern of the API.
 *
 * @param {string} character - One character, a whole emoji included.
 * @returns {number} Its UTF-8 bytes, plus one for the `\` before a `%`, a `_` or a `\`.
 */
const countPatternBytes = (character) => {
  const isEscaped = SEARCH_PATTERN_ESCAPED_CHARACTERS.includes(character);

  return utf8Encoder.encode(character).length + (isEscaped ? SEARCH_PATTERN_ESCAPE_BYTES : 0);
};

/**
 * Shortens a searched text to the longest start that the API accepts: the LIKE pattern that it
 * builds from the text holds `MAX_SEARCH_PATTERN_BYTES` UTF-8 bytes at most. A character is never
 * cut in half.
 *
 * @param {*} text - Searched text.
 * @returns {string} The text, or its longest start that fits the pattern; an empty text for a
 * value that is not a string.
 * @example
 * capSearchText('a'.repeat(60)).length; // 48
 * capSearchText('é'.repeat(30)).length; // 24, two bytes each
 */
const capSearchText = (text) => {
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

export { capSearchText };
