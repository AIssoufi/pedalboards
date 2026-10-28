/**
 * Longest text that the plugins can be searched with, in UTF-16 code units as `String.length`
 * counts them. It mirrors `MAX_SEARCH_TEXT_LENGTH` of `pedalboards-core-service/src/constants.js`:
 * the API refuses a longer text.
 */
export const MAX_SEARCH_TEXT_LENGTH = 100;
