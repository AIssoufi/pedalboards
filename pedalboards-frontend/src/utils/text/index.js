/**
 * Tells whether a value is a text with a character other than a space, so that it can be shown
 * or searched.
 *
 * @param {*} value - Value read from the API, a URL or a form.
 * @returns {boolean} True for a string that is not blank.
 * @example
 * isNonBlankText(' abGate '); // true
 * isNonBlankText('   '); // false
 * isNonBlankText(42); // false
 */
const isNonBlankText = value => typeof value === 'string' && value.trim() !== '';

export { isNonBlankText };
