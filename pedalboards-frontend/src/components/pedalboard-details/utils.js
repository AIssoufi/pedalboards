/**
 * Tells whether an entry of the control ports from the API can fill a row of the table.
 *
 * @param {*} controlPort - Entry of the control ports.
 * @returns {boolean} True for an object, which may still miss some of its fields.
 */
const isControlPort = controlPort => typeof controlPort === 'object' && controlPort !== null;

/**
 * Gives the text of a cell of the control ports table, from a field of a control port.
 *
 * @param {*} value - Field of the control port, such as its name or its default value.
 * @returns {string|number} The text or the finite number, or an empty text for any other value.
 * @example
 * toCellText(0.5); // 0.5
 * toCellText({ en: 'Gain' }); // ''
 */
const toCellText = (value) => {
  const isText = typeof value === 'string';
  const isFiniteNumber = typeof value === 'number' && Number.isFinite(value);

  return isText || isFiniteNumber ? value : '';
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
