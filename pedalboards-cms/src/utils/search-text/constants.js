/**
 * Longest LIKE pattern that the API searches with, in UTF-8 bytes: the text between two `%`, with
 * each `%`, `_` and `\` escaped by a `\`. It mirrors `MAX_SEARCH_PATTERN_BYTES` of
 * `pedalboards-core-service/src/constants.js`: the API refuses a text whose pattern is longer.
 */
export const MAX_SEARCH_PATTERN_BYTES = 50;

/** Bytes of the two `%` that the API puts around the searched text */
export const SEARCH_PATTERN_WRAPPER_BYTES = 2;

/** Characters that the API escapes with a `\` in the LIKE pattern, so each costs one more byte */
export const SEARCH_PATTERN_ESCAPED_CHARACTERS = ['%', '_', '\\'];

/** Byte of the `\` that the API puts before an escaped character */
export const SEARCH_PATTERN_ESCAPE_BYTES = 1;

/** Bytes left for the searched text and its escapes once the `%` around it are counted */
export const MAX_SEARCH_TEXT_BYTES = MAX_SEARCH_PATTERN_BYTES - SEARCH_PATTERN_WRAPPER_BYTES;

/**
 * Highest code point of each UTF-8 length, from one byte: a character above the last one takes
 * four bytes.
 */
export const UTF8_LENGTH_LIMITS = [0x7f, 0x7ff, 0xffff];

/** Bytes of a character above every limit of `UTF8_LENGTH_LIMITS` */
export const MAX_UTF8_CHARACTER_BYTES = 4;
