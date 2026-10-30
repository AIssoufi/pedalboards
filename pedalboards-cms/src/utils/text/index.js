/**
 * Tells whether a value is a text with at least one character.
 * @param {*} value value to check, from any source
 * @returns {boolean} true for a non-empty string, false for anything else
 * @example
 * isNonEmptyText('plugin not found'); // true
 * isNonEmptyText(''); // false
 * isNonEmptyText(404); // false
 */
export const isNonEmptyText = value => typeof value === 'string' && value !== '';
