// Constants
import { CELL_NUMBER_FORMAT, NEGATIVE_ZERO_TEXT } from './constants';

/**
 * Tells whether an entry of the control ports from the API can fill a row of the table.
 *
 * @param {*} controlPort - Entry of the control ports.
 * @returns {boolean} True for an object, which may still miss some of its fields.
 */
const isControlPort = controlPort => typeof controlPort === 'object' && controlPort !== null;

/**
 * Writes a number of the control ports table, rounded to 4 decimals.
 *
 * @param {number} value - Finite number of a control port.
 * @returns {string} The rounded number, `0` rather than `-0` for a negative number that rounds to
 * zero.
 */
const formatCellNumber = (value) => {
  const text = CELL_NUMBER_FORMAT.format(value);

  return text === NEGATIVE_ZERO_TEXT ? '0' : text;
};

/**
 * Gives the text of a cell of the control ports table, from a field of a control port.
 *
 * @param {*} value - Field of the control port, such as its name or its default value.
 * @returns {string} The text as it is, the finite number rounded to 4 decimals, or an empty text
 * for any other value.
 * @example
 * toCellText('Gain'); // 'Gain'
 * toCellText(0.10000000149011612); // '0.1'
 * toCellText({ en: 'Gain' }); // ''
 */
const toCellText = (value) => {
  const isText = typeof value === 'string';
  const isFiniteNumber = typeof value === 'number' && Number.isFinite(value);

  if (isText) {
    return value;
  }

  return isFiniteNumber ? formatCellNumber(value) : '';
};

/**
 * Tells whether a pedalboard count from the API is worth showing.
 *
 * @param {*} pedalboardCount - Number of pedalboards using the plugin.
 * @returns {boolean} True for a finite number above 0.
 * @example
 * hasPedalboards(3); // true
 * hasPedalboards(-1); // false
 */
const hasPedalboards = pedalboardCount => (
  typeof pedalboardCount === 'number' && Number.isFinite(pedalboardCount) && pedalboardCount > 0
);

export { hasPedalboards, isControlPort, toCellText };
