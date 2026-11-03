// Pure helpers of the install icons: they draw the icon in memory, for png.mjs to encode

// Constants
import { BRAND_RGB, PEDAL_ICON_SHAPES, RGB_CHANNELS, SAMPLES_PER_AXIS } from './constants.mjs';

// Utils
import { isImageSide } from './png.mjs';

/** @typedef {import('./png.mjs').RgbImage} RgbImage */

/**
 * @typedef {object} IconShape
 * @property {number} centerX - Horizontal center, in fractions of the icon side from the left.
 * @property {number} centerY - Vertical center, in fractions of the icon side from the top.
 * @property {number} halfWidth - Half the width, in fractions of the icon side.
 * @property {number} halfHeight - Half the height, in fractions of the icon side.
 * @property {number} radius - Radius of the corners, in fractions of the icon side.
 * @property {number[]} color - Red, green and blue of the shape, from 0 to 255.
 */

/**
 * @typedef {object} PointInShapeParams
 * @property {number} x - Horizontal position, in fractions of the icon side from the left.
 * @property {number} y - Vertical position, in fractions of the icon side from the top.
 * @property {IconShape} shape - Rounded rectangle to test.
 */

/**
 * Tells whether a point lies inside a rounded rectangle, its edge included.
 *
 * @param {PointInShapeParams} params - The point and the shape.
 * @returns {boolean} True when the point is inside.
 */
export const isInsideShape = ({ x, y, shape }) => {
  // Distance from the point to the inner rectangle that the rounded corners are centered on
  const outsideX = Math.max(Math.abs(x - shape.centerX) - (shape.halfWidth - shape.radius), 0);
  const outsideY = Math.max(Math.abs(y - shape.centerY) - (shape.halfHeight - shape.radius), 0);

  return outsideX ** 2 + outsideY ** 2 <= shape.radius ** 2;
};

/**
 * Gives the color of the icon at a point: the color of the last shape drawn over it, or the brand
 * color of the background.
 *
 * @param {{ x: number, y: number }} params - The point, in fractions of the icon side.
 * @returns {number[]} Red, green and blue, from 0 to 255.
 */
const readIconColor = ({ x, y }) => (
  PEDAL_ICON_SHAPES.findLast(shape => isInsideShape({ x, y, shape }))?.color ?? BRAND_RGB
);

/**
 * Draws the install icon: a white effect pedal with two knobs and a footswitch on the brand color.
 * Each pixel blends several samples, so the edges of the shapes are smooth at any size.
 *
 * @param {number} size - Width and height of the icon in pixels, a positive integer.
 * @returns {RgbImage} The square icon.
 * @throws {RangeError} When the size is not a positive integer.
 * @example
 * drawPedalIcon(192).pixels.length; // 192 * 192 * 3
 */
export const drawPedalIcon = size => {
  if (!isImageSide(size)) {
    throw new RangeError(`An icon size must be a positive integer, not ${size}`);
  }

  const pixels = new Uint8Array(size * size * RGB_CHANNELS);
  const samplesPerPixel = SAMPLES_PER_AXIS ** 2;

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const sums = new Array(RGB_CHANNELS).fill(0);

      for (let sampleRow = 0; sampleRow < SAMPLES_PER_AXIS; sampleRow += 1) {
        for (let sampleColumn = 0; sampleColumn < SAMPLES_PER_AXIS; sampleColumn += 1) {
          // Samples sit at the centers of an even grid inside the pixel
          const x = (column + (sampleColumn + 0.5) / SAMPLES_PER_AXIS) / size;
          const y = (row + (sampleRow + 0.5) / SAMPLES_PER_AXIS) / size;

          readIconColor({ x, y }).forEach((value, channel) => {
            sums[channel] += value;
          });
        }
      }

      const offset = (row * size + column) * RGB_CHANNELS;
      sums.forEach((sum, channel) => {
        pixels[offset + channel] = Math.round(sum / samplesPerPixel);
      });
    }
  }

  return { width: size, height: size, pixels };
};

/**
 * Names the file of an install icon, as the manifest lists it.
 *
 * @param {number} size - Width and height of the icon in pixels.
 * @returns {string} The file name in `public/`.
 * @example
 * toIconFileName(192); // 'icon-192.png'
 */
export const toIconFileName = size => `icon-${size}.png`;
