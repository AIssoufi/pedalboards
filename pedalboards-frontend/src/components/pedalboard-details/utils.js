// Constants
import { CELL_NUMBER_FORMAT, NEGATIVE_ZERO_TEXT, SCREENSHOT_HEIGHT_PROPERTY } from './constants';

// Utils
import { toImageDimension } from '../../utils/image-dimension';

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

/**
 * Size of the screenshot from the API, in pixels.
 *
 * @typedef {Object} ToScreenshotStyleParams
 * @property {*} [imageWidth] - Width of the screenshot.
 * @property {*} [imageHeight] - Height of the screenshot.
 */

/**
 * Gives the style that reserves the box of the screenshot before it loads: its height from the
 * API, which the style sheet caps like the loaded image, while its width follows from the ratio
 * of the `width` and `height` attributes.
 *
 * @param {ToScreenshotStyleParams} [params] - Size of the screenshot.
 * @returns {Object|undefined} The style holding the height, or undefined unless both sizes are
 *   whole numbers of pixels above 0, so that the image keeps its own size once loaded.
 * @example
 * toScreenshotStyle({ imageWidth: 261, imageHeight: 430 }); // { '--screenshot-height': '430px' }
 * toScreenshotStyle({ imageWidth: 261 }); // undefined
 */
const toScreenshotStyle = ({ imageWidth, imageHeight } = {}) => {
  const width = toImageDimension(imageWidth);
  const height = toImageDimension(imageHeight);
  const isSizeKnown = width !== undefined && height !== undefined;

  return isSizeKnown ? { [SCREENSHOT_HEIGHT_PROPERTY]: `${height}px` } : undefined;
};

export {
  hasPedalboards, isControlPort, toCellText, toScreenshotStyle
};
